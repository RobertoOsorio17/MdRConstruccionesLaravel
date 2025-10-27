<?php

namespace App\Events;

use App\Models\CommentReport;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event fired when a comment is reported.
 * 
 * This event is dispatched after a new comment report is created,
 * allowing the system to notify moderators and perform other actions.
 */
class CommentReported
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The comment report instance.
     *
     * @var CommentReport
     */
    public CommentReport $report;

    /**
     * Create a new event instance.
     *
     * @param CommentReport $report The newly created comment report
     */
    public function __construct(CommentReport $report)
    {
        $this->report = $report;
    }
}

