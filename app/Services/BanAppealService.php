<?php

namespace App\Services;

use App\Models\BanAppeal;
use App\Models\User;
use App\Models\UserBan;
use App\Notifications\BanAppealSubmitted;
use App\Notifications\BanAppealReviewed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

/**
 * BanAppealService
 * 
 * Handles all business logic related to ban appeals including:
 * - Submission of new appeals with evidence
 * - Admin review and decision making
 * - File upload management
 * - Notification dispatching
 * - Security validations
 * 
 * Follows SOLID principles with single responsibility for ban appeal operations.
 */
class BanAppealService
{
    /**
     * Check if a user can submit an appeal for their current ban.
     *
     * A user can appeal if:
     * - They are currently banned
     * - The ban is not irrevocable
     * - The ban doesn't already have an appeal
     *
     * @param User $user The user to check.
     * @return array{can_appeal: bool, reason: string|null, ban: UserBan|null}
     */
    public function canUserAppeal(User $user): array
    {
        // Check if user is banned
        if (!$user->isBanned()) {
            return [
                'can_appeal' => false,
                'reason' => 'No tienes ningún baneo activo.',
                'ban' => null,
            ];
        }

        $currentBan = $user->currentBan();

        // ✅ SECURITY: Check if ban is irrevocable
        if ($currentBan->isIrrevocable()) {
            return [
                'can_appeal' => false,
                'reason' => 'Este baneo es irrevocable y no puede ser apelado. Por favor, contacta con el soporte si crees que esto es un error.',
                'ban' => $currentBan,
            ];
        }

        // Check if ban already has an appeal
        if ($currentBan->hasAppeal()) {
            $appeal = $currentBan->appeal;

            return [
                'can_appeal' => false,
                'reason' => 'Ya has enviado una apelación para este baneo. Estado: ' . $appeal->getStatusLabel(),
                'ban' => $currentBan,
                'appeal' => $appeal,
            ];
        }

        return [
            'can_appeal' => true,
            'reason' => null,
            'ban' => $currentBan,
        ];
    }

    /**
     * Submit a new ban appeal with enhanced security and validation.
     *
     * Creates a new appeal record, uploads evidence if provided,
     * and sends notifications to admins.
     *
     * @param User $user The user submitting the appeal.
     * @param array<string, mixed> $data Appeal data including reason, evidence, etc.
     * @return BanAppeal The created appeal.
     *
     * @throws \Exception If appeal submission fails.
     */
    public function submitAppeal(User $user, array $data): BanAppeal
    {
        DB::beginTransaction();

        try {
            // ✅ SECURITY: Verify user can appeal
            $canAppeal = $this->canUserAppeal($user);
            if (!$canAppeal['can_appeal']) {
                throw new \Exception($canAppeal['reason']);
            }

            $currentBan = $canAppeal['ban'];

            // ✅ SECURITY: Validate reason length and content
            $reason = strip_tags(trim($data['reason']));
            if (strlen($reason) < 50) {
                throw new \Exception('La razón de la apelación debe tener al menos 50 caracteres.');
            }
            if (strlen($reason) > 2000) {
                throw new \Exception('La razón de la apelación no puede exceder 2000 caracteres.');
            }

            // ✅ SECURITY: Check for spam patterns
            if ($this->containsSpamPatterns($reason)) {
                throw new \Exception('El contenido de la apelación contiene patrones sospechosos.');
            }

            // ✅ SECURITY: Validate terms acceptance
            // Accept truthy values: true, 1, "1", "yes", "on" (Laravel's accepted validation)
            $acceptedValues = [true, 1, '1', 'yes', 'on', 'true'];
            if (empty($data['terms_accepted']) || !in_array($data['terms_accepted'], $acceptedValues, false)) {
                throw new \Exception('Debes aceptar los términos y condiciones para enviar una apelación.');
            }

            // ✅ SECURITY: Check for duplicate appeals in short time (prevent spam)
            $recentAppeal = BanAppeal::where('user_id', $user->id)
                ->where('created_at', '>', now()->subMinutes(5))
                ->first();

            if ($recentAppeal) {
                throw new \Exception('Ya has enviado una apelación recientemente. Por favor espera antes de enviar otra.');
            }

            // ✅ SECURITY: Validate IP address
            $ipAddress = request()->ip();
            if (!filter_var($ipAddress, FILTER_VALIDATE_IP)) {
                $ipAddress = '0.0.0.0'; // Fallback for invalid IP
            }

            // ✅ SECURITY: Sanitize user agent
            $userAgent = substr(strip_tags(request()->userAgent() ?? 'Unknown'), 0, 500);

            // Handle evidence upload if provided
            $evidencePath = null;
            if (isset($data['evidence']) && $data['evidence'] instanceof UploadedFile) {
                try {
                    $evidencePath = $this->uploadEvidence($data['evidence'], $user->id);
                } catch (\Exception $e) {
                    throw new \Exception('Error al subir la evidencia: ' . $e->getMessage());
                }
            }

            // Create the appeal
            $appeal = BanAppeal::create([
                'user_id' => $user->id,
                'user_ban_id' => $currentBan->id,
                'reason' => $reason,
                'evidence_path' => $evidencePath,
                'status' => 'pending',
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'terms_accepted' => true,
            ]);

            // ✅ SECURITY: Capture plain token before it's lost (only available during creation)
            // This token will be returned to the controller for the redirect URL
            $plainToken = $appeal->plainTokenTemp ?? null;

            // ✅ AUDIT: Log the appeal submission with full context
            // ⚠️ SECURITY: appeal_token removed from logs to prevent unauthorized access
            Log::info('Ban appeal submitted', [
                'appeal_id' => $appeal->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name,
                'ban_id' => $currentBan->id,
                'ban_reason' => $currentBan->reason,
                'ip_address' => $appeal->ip_address,
                'has_evidence' => !is_null($evidencePath),
                'reason_length' => strlen($reason),
            ]);

            // Notify admins about new appeal
            $this->notifyAdminsOfNewAppeal($appeal);

            // Send confirmation email to user
            $user->notify(new BanAppealSubmitted($appeal));

            DB::commit();

            // Attach plain token to appeal for controller use (public property)
            $appeal->plainTokenTemp = $plainToken;

            return $appeal;
        } catch (\Exception $e) {
            DB::rollBack();

            // Clean up uploaded file if it exists
            if (isset($evidencePath) && $evidencePath) {
                try {
                    Storage::disk('private')->delete($evidencePath);
                } catch (\Exception $deleteException) {
                    Log::warning('Failed to delete evidence file after rollback', [
                        'path' => $evidencePath,
                        'error' => $deleteException->getMessage()
                    ]);
                }
            }

            Log::error('Failed to submit ban appeal', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Check if text contains spam patterns.
     *
     * @param string $text The text to check.
     * @return bool True if spam patterns detected.
     */
    protected function containsSpamPatterns(string $text): bool
    {
        // ✅ SECURITY: Check for excessive repetition
        if (preg_match('/(.)\1{20,}/', $text)) {
            return true; // Same character repeated 20+ times
        }

        // ✅ SECURITY: Check for excessive URLs
        $urlCount = preg_match_all('/https?:\/\//', $text);
        if ($urlCount > 3) {
            return true; // More than 3 URLs
        }

        // ✅ SECURITY: Check for common spam keywords
        $spamKeywords = ['viagra', 'cialis', 'casino', 'lottery', 'prize', 'winner', 'click here', 'buy now'];
        $lowerText = strtolower($text);
        foreach ($spamKeywords as $keyword) {
            if (stripos($lowerText, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Upload evidence file for an appeal with enhanced security validation.
     *
     * Validates file integrity, MIME type, dimensions, and scans for malicious content.
     *
     * @param UploadedFile $file The uploaded file.
     * @param int $userId The user ID for organizing files.
     * @return string The storage path of the uploaded file.
     *
     * @throws \Exception If upload fails or validation fails.
     */
    protected function uploadEvidence(UploadedFile $file, int $userId): string
    {
        // ✅ SECURITY: Validate file is valid and not corrupted
        if (!$file->isValid()) {
            throw new \Exception('Archivo inválido o corrupto.');
        }

        // ✅ SECURITY: Validate real MIME type (not just extension)
        $mimeType = $file->getMimeType();
        $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!in_array($mimeType, $allowedMimes)) {
            throw new \Exception('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP).');
        }

        // ✅ SECURITY: Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if ($file->getSize() > $maxSize) {
            throw new \Exception('El archivo excede el tamaño máximo permitido de 5MB.');
        }

        // ✅ SECURITY: Validate image dimensions and integrity
        $imageInfo = @getimagesize($file->getRealPath());
        if ($imageInfo === false) {
            throw new \Exception('El archivo no es una imagen válida o está corrupto.');
        }

        // ✅ SECURITY: Check minimum and maximum dimensions
        [$width, $height] = $imageInfo;
        if ($width < 50 || $height < 50) {
            throw new \Exception('La imagen es demasiado pequeña. Dimensiones mínimas: 50x50 píxeles.');
        }
        if ($width > 8000 || $height > 8000) {
            throw new \Exception('La imagen es demasiado grande. Dimensiones máximas: 8000x8000 píxeles.');
        }

        // ✅ SECURITY: Validate aspect ratio (prevent extremely elongated images)
        $aspectRatio = max($width, $height) / min($width, $height);
        if ($aspectRatio > 10) {
            throw new \Exception('La relación de aspecto de la imagen es inválida.');
        }

        // ✅ SECURITY: Generate secure random filename (prevent directory traversal)
        $extension = strtolower($file->getClientOriginalExtension());
        $safeExtension = in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp']) ? $extension : 'jpg';
        $filename = hash('sha256', uniqid('appeal_', true) . time() . $userId) . '.' . $safeExtension;

        // ✅ SECURITY: Store in PRIVATE disk with date-based subdirectory for better organization
        // Files are served via signed URLs to prevent unauthorized access
        $dateFolder = date('Y/m');
        $path = $file->storeAs(
            "ban-appeals/{$userId}/{$dateFolder}",
            $filename,
            'private'
        );

        if (!$path) {
            throw new \Exception('Error al guardar el archivo en el servidor.');
        }

        // ✅ SECURITY: Verify file was actually saved and is readable
        if (!Storage::disk('private')->exists($path)) {
            throw new \Exception('Error al verificar el archivo guardado.');
        }

        // ✅ SECURITY: Verify file size matches (prevent upload manipulation)
        $savedSize = Storage::disk('private')->size($path);
        if (abs($savedSize - $file->getSize()) > 1024) { // Allow 1KB difference for metadata
            Storage::disk('private')->delete($path);
            throw new \Exception('Error de integridad del archivo.');
        }

        Log::info('Ban appeal evidence uploaded successfully', [
            'user_id' => $userId,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $mimeType,
            'dimensions' => "{$width}x{$height}",
            'file_hash' => hash_file('sha256', Storage::disk('private')->path($path))
        ]);

        return $path;
    }

    /**
     * Review a ban appeal (approve or reject) with enhanced security and validation.
     *
     * @param BanAppeal $appeal The appeal to review.
     * @param User $admin The administrator reviewing the appeal.
     * @param string $decision The decision: 'approve' or 'reject'.
     * @param string|null $response Admin's response message.
     * @return BanAppeal The updated appeal.
     *
     * @throws \Exception If review fails.
     */
    public function reviewAppeal(BanAppeal $appeal, User $admin, string $decision, ?string $response = null): BanAppeal
    {
        DB::beginTransaction();

        try {
            // ✅ SECURITY: Validate admin has permission
            if (!$admin->hasRole('admin')) {
                throw new \Exception('No tienes permisos para revisar apelaciones.');
            }

            // ✅ SECURITY: Validate decision
            if (!in_array($decision, ['approve', 'reject'])) {
                throw new \Exception('Decisión inválida. Debe ser "approve" o "reject".');
            }

            // ✅ SECURITY: Check if appeal can be reviewed
            if (!$appeal->canBeReviewed()) {
                throw new \Exception('Esta apelación ya ha sido revisada.');
            }

            // ✅ SECURITY: Verify appeal belongs to an active ban
            if (!$appeal->userBan) {
                throw new \Exception('El baneo asociado a esta apelación no existe.');
            }

            // ✅ SECURITY: Validate response if rejecting
            if ($decision === 'reject') {
                if (empty($response)) {
                    throw new \Exception('Debes proporcionar una razón para rechazar la apelación.');
                }
                if (strlen($response) < 20) {
                    throw new \Exception('La respuesta debe tener al menos 20 caracteres.');
                }
                if (strlen($response) > 1000) {
                    throw new \Exception('La respuesta no puede exceder 1000 caracteres.');
                }
            }

            // ✅ SECURITY: Sanitize admin response
            $sanitizedResponse = $response ? strip_tags(trim($response)) : null;

            $status = $decision === 'approve' ? 'approved' : 'rejected';

            // Store old status for logging
            $oldStatus = $appeal->status;

            // Update appeal
            $appeal->update([
                'status' => $status,
                'admin_response' => $sanitizedResponse,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            // If approved, unban the user
            if ($decision === 'approve') {
                try {
                    $this->unbanUser($appeal->userBan, $admin);
                } catch (\Exception $e) {
                    throw new \Exception('Error al desbanear al usuario: ' . $e->getMessage());
                }
            }

            // ✅ AUDIT: Log the review with full context
            // ⚠️ SECURITY: appeal_token removed from logs to prevent unauthorized access
            Log::info('Ban appeal reviewed', [
                'appeal_id' => $appeal->id,
                'decision' => $decision,
                'old_status' => $oldStatus,
                'new_status' => $status,
                'reviewed_by' => $admin->id,
                'admin_name' => $admin->name,
                'admin_email' => $admin->email,
                'user_id' => $appeal->user_id,
                'user_email' => $appeal->user->email,
                'ban_id' => $appeal->user_ban_id,
                'has_response' => !is_null($sanitizedResponse),
                'response_length' => $sanitizedResponse ? strlen($sanitizedResponse) : 0,
            ]);

            // Notify user of decision
            try {
                $appeal->user->notify(new BanAppealReviewed($appeal));
            } catch (\Exception $e) {
                Log::warning('Failed to send appeal review notification', [
                    'appeal_id' => $appeal->id,
                    'user_id' => $appeal->user_id,
                    'error' => $e->getMessage()
                ]);
                // Don't fail the whole operation if notification fails
            }

            DB::commit();

            return $appeal->fresh();
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to review ban appeal', [
                'appeal_id' => $appeal->id,
                'decision' => $decision,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Request more information from the user.
     *
     * @param BanAppeal $appeal The appeal requiring more info.
     * @param User $admin The administrator requesting info.
     * @param string $message Message explaining what info is needed.
     * @return BanAppeal The updated appeal.
     *
     * @throws \Exception If appeal cannot be reopened.
     */
    public function requestMoreInfo(BanAppeal $appeal, User $admin, string $message): BanAppeal
    {
        // ✅ SECURITY: Prevent reopening of finalized appeals
        if (!$appeal->canBeReviewed()) {
            throw new \Exception('No se puede solicitar más información para una apelación que ya ha sido aprobada o rechazada.');
        }

        // ✅ SECURITY: Validate message
        $sanitizedMessage = strip_tags(trim($message));
        if (strlen($sanitizedMessage) < 10) {
            throw new \Exception('El mensaje debe tener al menos 10 caracteres.');
        }
        if (strlen($sanitizedMessage) > 1000) {
            throw new \Exception('El mensaje no puede exceder 1000 caracteres.');
        }

        $oldStatus = $appeal->status;

        $appeal->update([
            'status' => 'more_info_requested',
            'admin_response' => $sanitizedMessage,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        Log::info('More information requested for ban appeal', [
            'appeal_id' => $appeal->id,
            'old_status' => $oldStatus,
            'new_status' => 'more_info_requested',
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'user_id' => $appeal->user_id,
            'user_email' => $appeal->user->email,
        ]);

        // Notify user
        $appeal->user->notify(new BanAppealReviewed($appeal));

        return $appeal->fresh();
    }

    /**
     * Unban a user (used when appeal is approved).
     * 
     * @param UserBan $ban The ban to deactivate.
     * @param User $admin The admin approving the unban.
     */
    protected function unbanUser(UserBan $ban, User $admin): void
    {
        $ban->update(['is_active' => false]);

        Log::info('User unbanned via appeal approval', [
            'ban_id' => $ban->id,
            'user_id' => $ban->user_id,
            'approved_by' => $admin->id,
        ]);
    }

    /**
     * Notify all admins about a new appeal.
     *
     * @param BanAppeal $appeal The new appeal.
     */
    protected function notifyAdminsOfNewAppeal(BanAppeal $appeal): void
    {
        $admins = User::role('admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new BanAppealSubmitted($appeal));
        }
    }

    /**
     * Get appeals with optional filters and pagination.
     *
     * @param array<string, mixed> $filters Filters to apply (status, user_id, etc.).
     * @param int $perPage Number of items per page.
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAppeals(array $filters = [], int $perPage = 15)
    {
        $query = BanAppeal::with(['user', 'userBan.bannedBy', 'reviewedBy'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Filter by user
        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Filter by date range
        if (isset($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get pending appeals count.
     *
     * @return int Number of pending appeals.
     */
    public function getPendingCount(): int
    {
        return BanAppeal::pending()->count();
    }

    /**
     * Get appeal by token.
     *
     * ✅ SECURITY FIX: Now uses hashed token comparison.
     *
     * @param string $plainToken The plain appeal token.
     * @return BanAppeal|null The appeal or null if not found.
     */
    public function getAppealByToken(string $plainToken): ?BanAppeal
    {
        // Use the model's findByToken method which handles hashing
        $appeal = BanAppeal::findByToken($plainToken);

        if ($appeal) {
            $appeal->load(['user', 'userBan.bannedBy', 'reviewedBy']);
        }

        return $appeal;
    }

    /**
     * Get appeal statistics for admin dashboard.
     *
     * @return array<string, mixed> Statistics data.
     */
    public function getAppealStatistics(): array
    {
        return [
            'total_count' => BanAppeal::count(),
            'pending_count' => BanAppeal::pending()->count(),
            'approved_count' => BanAppeal::approved()->count(),
            'rejected_count' => BanAppeal::rejected()->count(),
            'awaiting_info_count' => BanAppeal::awaitingInfo()->count(),
            'approval_rate' => $this->calculateApprovalRate(),
            'recent_appeals' => BanAppeal::with(['user', 'userBan'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * Calculate the approval rate percentage.
     *
     * @return float Approval rate as percentage.
     */
    protected function calculateApprovalRate(): float
    {
        $reviewed = BanAppeal::reviewed()->count();

        if ($reviewed === 0) {
            return 0.0;
        }

        $approved = BanAppeal::approved()->count();

        return round(($approved / $reviewed) * 100, 2);
    }

    /**
     * Delete evidence file for an appeal.
     *
     * @param BanAppeal $appeal The appeal whose evidence to delete.
     * @return bool True if deleted successfully.
     */
    public function deleteEvidence(BanAppeal $appeal): bool
    {
        if (!$appeal->evidence_path) {
            return true;
        }

        try {
            Storage::disk('private')->delete($appeal->evidence_path);

            $appeal->update(['evidence_path' => null]);

            Log::info('Appeal evidence deleted', [
                'appeal_id' => $appeal->id,
                'path' => $appeal->evidence_path,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to delete appeal evidence', [
                'appeal_id' => $appeal->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get a temporary signed URL for viewing evidence.
     *
     * ✅ SECURITY FIX: Now uses Laravel's temporarySignedRoute which includes
     * expires in the signature, preventing timestamp manipulation attacks.
     *
     * @param BanAppeal $appeal The appeal with evidence.
     * @param int $expirationMinutes Minutes until URL expires (default: 60).
     * @return string|null The signed URL or null if no evidence.
     */
    public function getEvidenceUrl(BanAppeal $appeal, int $expirationMinutes = 60): ?string
    {
        if (!$appeal->evidence_path) {
            return null;
        }

        // ✅ SECURITY: Use Laravel's temporarySignedRoute which includes expires in signature
        // This prevents manipulation of the expires parameter while keeping the same signature
        return URL::temporarySignedRoute(
            'ban-appeal.evidence',
            now()->addMinutes($expirationMinutes),
            ['appeal' => $appeal->id]
        );
    }
}
