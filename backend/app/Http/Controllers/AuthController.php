<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'region' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'gender' => 'required|string|max:255',
            'school_location' => 'required|string|max:255',
            'pedagogical_experience' => 'required|integer|min:0',
            'group' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'region' => $request->region,
            'position' => $request->position,
            'gender' => $request->gender,
            'school_location' => $request->school_location,
            'pedagogical_experience' => $request->pedagogical_experience,
            'group' => $request->group,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login a user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid login credentials',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out'
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'region' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('region')) $user->region = $request->region;
        if ($request->has('position')) $user->position = $request->position;

        if ($request->hasFile('avatar')) {
            if ($user->avatar && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->avatar)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
            }
            
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'user' => $user
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $totalScore = \App\Models\UserProgress::where('user_id', $user->id)->sum('score');

        // Calculate rank based on total score
        $rank = \Illuminate\Support\Facades\DB::table('user_progress')
            ->select('user_id', \Illuminate\Support\Facades\DB::raw('SUM(score) as total'))
            ->groupBy('user_id')
            ->havingRaw('SUM(score) > ?', [$totalScore])
            ->get()
            ->count() + 1;

        $completedModulesCount = \App\Models\UserProgress::where('user_id', $user->id)->count();

        return response()->json([
            'status' => 'success',
            'user' => $user,
            'total_score' => $totalScore,
            'rank' => $rank,
            'completed_modules' => $completedModulesCount
        ], 200);
    }

    public function leaderboard(Request $request)
    {
        $topUsers = \App\Models\User::select('users.id', 'users.name', 'users.region', 'users.position')
            ->selectRaw('COALESCE(SUM(user_progress.score), 0) as total_score')
            ->leftJoin('user_progress', 'users.id', '=', 'user_progress.user_id')
            ->groupBy('users.id', 'users.name', 'users.region', 'users.position')
            ->orderBy('total_score', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'status' => 'success',
            'leaderboard' => $topUsers
        ], 200);
    }
}
