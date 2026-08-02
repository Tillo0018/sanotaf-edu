<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Author;
use App\Models\AuthorWork;
use App\Models\ProjectInfo;
use App\Models\Certificate;
use Illuminate\Support\Facades\Storage;

class AboutController extends Controller
{
    // Public Endpoint
    public function getAboutData()
    {
        $authors = Author::with(['works', 'experiences'])->orderBy('order', 'asc')->get();
        $projectInfos = ProjectInfo::orderBy('order', 'asc')->get();
        $certificates = Certificate::orderBy('order', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'authors' => $authors,
            'projectInfos' => $projectInfos,
            'certificates' => $certificates
        ], 200);
    }

    // --- Admin Endpoints ---

    // Project Info
    public function saveProjectInfo(Request $request, $id = null)
    {
        $data = $request->validate([
            'title' => 'nullable|string',
            'content' => 'nullable|string',
            'order' => 'nullable|integer'
        ]);

        $projectInfo = $id ? ProjectInfo::findOrFail($id) : new ProjectInfo();
        
        if ($request->hasFile('image')) {
            if ($projectInfo->image_url) {
                Storage::disk('public')->delete($projectInfo->image_url);
            }
            $path = $request->file('image')->store('about', 'public');
            $data['image_url'] = $path;
        }

        $projectInfo->fill($data);
        $projectInfo->save();

        return response()->json(['status' => 'success', 'projectInfo' => $projectInfo], 200);
    }

    public function deleteProjectInfo($id)
    {
        $projectInfo = ProjectInfo::findOrFail($id);
        if ($projectInfo->image_url) {
            Storage::disk('public')->delete($projectInfo->image_url);
        }
        $projectInfo->delete();
        return response()->json(['status' => 'success'], 200);
    }

    // Author
    public function saveAuthor(Request $request, $id = null)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'bio' => 'nullable|string',
            'order' => 'nullable|integer'
        ]);

        $author = $id ? Author::findOrFail($id) : new Author();
        
        if ($request->hasFile('image')) {
            if ($author->image_url) {
                Storage::disk('public')->delete($author->image_url);
            }
            $path = $request->file('image')->store('authors', 'public');
            $data['image_url'] = $path;
        }

        $author->fill($data);
        $author->save();

        return response()->json(['status' => 'success', 'author' => $author->load(['works', 'experiences'])], 200);
    }

    public function deleteAuthor($id)
    {
        $author = Author::findOrFail($id);
        if ($author->image_url) {
            Storage::disk('public')->delete($author->image_url);
        }
        $author->delete();
        return response()->json(['status' => 'success'], 200);
    }

    // Author Works
    public function saveAuthorWork(Request $request, $authorId, $workId = null)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'type' => 'required|string',
            'year' => 'nullable|string',
            'order' => 'nullable|integer'
        ]);

        $work = $workId ? AuthorWork::findOrFail($workId) : new AuthorWork();
        $work->author_id = $authorId;
        
        if ($request->hasFile('file')) {
            if ($work->file_url) {
                Storage::disk('public')->delete($work->file_url);
            }
            $path = $request->file('file')->store('works', 'public');
            $data['file_url'] = $path;
        }

        $work->fill($data);
        $work->save();

        return response()->json(['status' => 'success', 'work' => $work], 200);
    }

    public function deleteAuthorWork($id)
    {
        $work = AuthorWork::findOrFail($id);
        if ($work->file_url) {
            Storage::disk('public')->delete($work->file_url);
        }
        $work->delete();
        return response()->json(['status' => 'success'], 200);
    }

    // Author Experiences
    public function saveAuthorExperience(Request $request, $authorId, $expId = null)
    {
        $data = $request->validate([
            'years' => 'required|string',
            'position' => 'required|string',
            'workplace' => 'required|string',
            'order' => 'nullable|integer'
        ]);

        $experience = $expId ? \App\Models\AuthorExperience::findOrFail($expId) : new \App\Models\AuthorExperience();
        $experience->author_id = $authorId;
        
        $experience->fill($data);
        $experience->save();

        return response()->json(['status' => 'success', 'experience' => $experience], 200);
    }

    public function deleteAuthorExperience($id)
    {
        $experience = \App\Models\AuthorExperience::findOrFail($id);
        $experience->delete();
        return response()->json(['status' => 'success'], 200);
    }

    // Certificates
    public function saveCertificate(Request $request, $id = null)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'order' => 'nullable|integer'
        ]);

        $certificate = $id ? Certificate::findOrFail($id) : new Certificate();
        
        if ($request->hasFile('image')) {
            if ($certificate->image_url) {
                Storage::disk('public')->delete($certificate->image_url);
            }
            $path = $request->file('image')->store('certificates', 'public');
            $data['image_url'] = $path;
        }

        $certificate->fill($data);
        $certificate->save();

        return response()->json(['status' => 'success', 'certificate' => $certificate], 200);
    }

    public function deleteCertificate($id)
    {
        $certificate = Certificate::findOrFail($id);
        if ($certificate->image_url) {
            Storage::disk('public')->delete($certificate->image_url);
        }
        $certificate->delete();
        return response()->json(['status' => 'success'], 200);
    }
}
