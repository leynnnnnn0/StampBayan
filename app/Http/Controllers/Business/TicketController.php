<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        
        $query = Auth::user()->business->tickets()
            ->with('latestReply')
            ->withCount('replies')
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $tickets = $query->get()->map(function($ticket) {
            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'status_color' => $ticket->status_color,
                'priority_color' => $ticket->priority_color,
                'created_at' => $ticket->created_at->format('M d, Y h:i A'),
                'replies_count' => $ticket->replies_count,
                'has_images' => !empty($ticket->images),
                'last_reply' => $ticket->latestReply ? [
                    'message' => $ticket->latestReply->message,
                    'created_at' => $ticket->latestReply->created_at->format('M d, Y h:i A'),
                    'is_staff' => $ticket->latestReply->is_staff,
                ] : null,
            ];
        });

        $counts = [
            'all' => Auth::user()->business->tickets()->count(),
            'open' => Auth::user()->business->tickets()->where('status', 'open')->count(),
            'in_progress' => Auth::user()->business->tickets()->where('status', 'in_progress')->count(),
            'resolved' => Auth::user()->business->tickets()->where('status', 'resolved')->count(),
            'closed' => Auth::user()->business->tickets()->where('status', 'closed')->count(),
        ];

        return Inertia::render('Business/Ticket/Index', [
            'tickets' => $tickets,
            'counts' => $counts,
            'currentStatus' => $status
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'images.*' => 'nullable|image|max:51200' // 5MB max per image
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('tickets', 'public');
                $imagePaths[] = $path;
            }
        }

        $ticket = Ticket::create([
            'business_id' => Auth::user()->business->id,
            'ticket_number' => Ticket::generateTicketNumber(),
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'images' => $imagePaths,
            'status' => 'open'
        ]);

        return redirect()->back()->with('success', 'Ticket created successfully!');
    }

    public function show($id)
    {
        $ticket = Auth::user()->business->tickets()
            ->with(['replies.user'])
            ->findOrFail($id);

        return Inertia::render('Business/Ticket/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'status_color' => $ticket->status_color,
                'priority_color' => $ticket->priority_color,
                'created_at' => $ticket->created_at->format('M d, Y h:i A'),
                'images' => $ticket->images ? array_map(function($path) {
                    return Storage::url($path);
                }, $ticket->images) : [],
                'replies' => $ticket->replies->map(function($reply) {
                    return [
                        'id' => $reply->id,
                        'message' => $reply->message,
                        'is_staff' => $reply->is_staff,
                        'created_at' => $reply->created_at->format('M d, Y h:i A'),
                        'images' => $reply->images ? array_map(function($path) {
                            return Storage::url($path);
                        }, $reply->images) : [],
                        'user' => $reply->user ? [
                            'name' => $reply->user->username,
                            'email' => $reply->user->email,
                        ] : null,
                    ];
                })
            ]
        ]);
    }

    public function reply(Request $request, $id)
    {
        $ticket = Auth::user()->business->tickets()->findOrFail($id);

        $validated = $request->validate([
            'message' => 'required|string',
            'images.*' => 'nullable|image|max:5120'
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('ticket-replies', 'public');
                $imagePaths[] = $path;
            }
        }

        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'images' => $imagePaths,
            'is_staff' => false
        ]);

        return redirect()->back()->with('success', 'Reply added successfully!');
    }
}
