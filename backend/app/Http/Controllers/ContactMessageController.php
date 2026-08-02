<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactMessageController extends Controller
{
    // Public endpoint to store contact messages
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $message = new ContactMessage([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
        ]);

        // Attempt to get authenticated user if using sanctum
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            $message->user_id = $user->id;
        }

        $message->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Xabar muvaffaqiyatli yuborildi',
            'data' => $message
        ]);
    }

    // Authenticated user gets their own messages
    public function userMessages(Request $request)
    {
        $messages = ContactMessage::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'messages' => $messages
        ]);
    }

    // Admin gets all messages
    public function adminMessages(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = ContactMessage::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'messages' => $messages
        ]);
    }

    // Admin replies to a message
    public function adminReply(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'reply' => 'required|string'
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->admin_reply = $request->reply;
        $message->is_read = true;
        $message->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Javob yuborildi',
            'data' => $message
        ]);
    }
    
    // Mark as read by admin without replying
    public function markAsRead(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $message = ContactMessage::findOrFail($id);
        $message->is_read = true;
        $message->save();
        
        return response()->json([
            'status' => 'success',
            'data' => $message
        ]);
    }
}
