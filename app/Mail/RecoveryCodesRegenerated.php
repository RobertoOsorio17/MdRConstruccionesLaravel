<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Mail notification for recovery codes regenerated events.
 */
class RecoveryCodesRegenerated extends Mailable
{
    use Queueable, SerializesModels;

    
    
    
    
    /**

    
    
    
     * Handle __construct.

    
    
    
     *

    
    
    
     * @return void

    
    
    
     */
    
    
    
    
    
    
    
    public function __construct()
    {
        //
    }

    
    
    
    
    /**

    
    
    
     * Handle envelope.

    
    
    
     *

    
    
    
     * @return Envelope

    
    
    
     */
    
    
    
    
    
    
    
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recovery Codes Regenerated',
        );
    }

    
    
    
    
    /**

    
    
    
     * Handle content.

    
    
    
     *

    
    
    
     * @return Content

    
    
    
     */
    
    
    
    
    
    
    
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }

    
    
    
    
    /**

    
    
    
     * Handle attachments.

    
    
    
     *

    
    
    
     * @return array

    
    
    
     */
    
    
    
    
    
    
    
    public function attachments(): array
    {
        return [];
    }
}
