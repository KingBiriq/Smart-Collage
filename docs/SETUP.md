# Smart Collage: activate cloud content and video

Current release adds a shared Supabase catalogue, admin login, teacher photo uploads,
Bunny direct TUS uploads, signed web playback, and practice-question editing/import.
Without Supabase configuration the existing browser-local demo remains available.
It is not a completed native mobile app or a production billing/DRM system.

## 1. Supabase

Choose a dedicated Smart Collage project and run `supabase/migrations/20261016_content.sql` once.
Create the school administrator in Supabase Authentication > Users. Add that user's UUID
into `sc_admins` using the commented SQL in the migration. Do not grant all registered
users admin access. The application validates each session with Supabase Auth and checks
admin membership on every privileged endpoint. Login sessions last until the access
JWT expires; users then sign in again. There is no automatic refresh in this release.

Set these in Vercel > smart-collage > Settings > Environment Variables (Production):
- `SUPABASE_URL`: project's HTTPS URL
- `SUPABASE_PUBLISHABLE_KEY`: active publishable key

No service-role key is required. RLS restricts writes and photo uploads to administrators.
The catalogue and practice answers are public; private student records must never be placed
in this document. Authenticated students only read their own class entitlements.
Cloud editing uses a revision check to prevent overwriting another administrator's changes.
Existing demo content is not silently copied into the database.

## 2. Bunny Stream

Create a video library named Smart Collage. In its API tab copy the library ID and
library API key. In Security, obtain the **Token authentication key**; it is different
from the library API key. Enter them directly in Vercel environment variables:
- `BUNNY_STREAM_LIBRARY_ID`
- `BUNNY_STREAM_API_KEY` (sensitive)
- `BUNNY_STREAM_TOKEN_AUTH_KEY` (sensitive)

Redeploy, then enable Embed view token authentication in Bunny. Configure allowed embed
origins for the production domain and explicitly approved previews. For stronger content
protection, configure the appropriate Bunny CDN/MediaCage settings before paid launch;
embed signing alone does not provide DRM or prevent browser recording.

Admin > Lessons > Video library: enter a title, choose the video, and upload. The browser
uploads straight to Bunny with a six-hour signature, not through Vercel's request body.
Pause/retry works in the current page session. Keep the page open; reload-resume is not
implemented. A finished upload may still be encoding. A saved video can then be selected
in the lesson's class > subject > chapter dropdown workflow.

## 3. Playback and access

Website/student portal now supports signed Bunny playback. Each request checks a real
Supabase user and an unexpired `sc_enrollments` row for the lesson's class (admins may
preview all lessons). Create genuine student accounts and explicit class entitlements
in Supabase until payment webhooks and enrolment management are implemented. Demo
checkout cannot grant real access. Embed links expire after 15 minutes; re-opening a
lesson obtains a fresh link. Native Expo playback, secure offline downloads, device
limits, payment verification and capture protection remain separate work.

## 4. Teachers, public video and questions

Teachers: choose a JPG/PNG/WebP photo under 2MB. Cloud photos use Supabase Storage.
Select the teacher on each lesson; their photo appears beneath its player.
Welcome: select a presenting teacher and add a public YouTube or HTTPS MP4/WebM URL.
This is marketing content. Do not paste a paid lesson's URL here.

Quizzes: create a class/subject practice quiz, add manual questions or import TXT/JSON/
text-based PDF. A review step precedes insertion. PDF images/scans require OCR first;
missing answer keys are never guessed. Limits: 10MB, 50 PDF pages, 200 questions per quiz.
Each item needs four options and the correct answer. Use the on-screen template.

## Verification before launch

- Test admin login, deny ordinary users upload/content writes, test logout.
- Save teacher/photo/lesson; confirm a second browser sees them.
- Upload a short owned video; wait for Bunny encoding, then watch as an enrolled student.
- Verify anonymous, expired and unpurchased-class access are denied.
- Import a real question PDF, review all questions and answer keys, save and take the quiz.

Docs: https://bunny.net/docs/stream/tus-resumable-uploads
https://bunny.net/docs/stream/token-authentication
https://supabase.com/docs/guides/storage/security/access-control
