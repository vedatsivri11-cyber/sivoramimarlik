# Sivora website setup

Public site: `index.html`  
Private project manager: `admin.html`

The public page does not contain the upload form. Project records and photos are loaded from Supabase. Only signed-in users can add or remove projects; the public gallery can read them. The project photo bucket is public so site visitors can view portfolio photos. Project locations are displayed publicly.

## 1. Create the Supabase project

1. Create a Supabase project and open its dashboard.
2. In **Authentication settings**, turn off public user sign-ups. There is no sign-up form in this site; create the owner account manually in **Authentication → Users**.
3. Run `supabase-setup.sql` once in **SQL Editor**. This creates the projects table, storage bucket, and row/storage policies.
4. In **Project Settings → API**, copy the Project URL and the publishable key. Put them in `supabase-config.js`:

```js
window.SIVORA_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
window.SIVORA_SUPABASE_ANON_KEY = 'YOUR_PUBLISHABLE_KEY';
```

Use only the publishable/anon key in the browser. Never put a `service_role` or secret key in this folder.

## 2. Publish the website

The folder is a static site and needs no build step. Sign in to Netlify, use its manual drag-and-drop deploy, and upload the contents of this folder. Netlify will give the site a temporary `*.netlify.app` address. Add that address to the Supabase Auth URL configuration as the site URL and allowed redirect URL. A custom domain can be connected later.

## 3. Manage projects

Open `https://YOUR-SITE/admin.html`, sign in with the owner account, and add project name, photo, and public location. JPEG, PNG, or WebP images up to 5 MB are accepted. New records appear on the public home page. Use **Sil** to remove a project and its photo.

Before adding a full street address, decide whether it should be visible to every visitor; the location field is public.
