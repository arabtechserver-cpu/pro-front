"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function addBlogPost(formData: FormData) {
  const token = cookies().get('admin_token')?.value;
  const payload = {
    titleEn: formData.get("titleEn") as string,
    titleAr: formData.get("titleAr") as string,
    excerptEn: formData.get("excerptEn") as string,
    excerptAr: formData.get("excerptAr") as string,
    contentEn: formData.get("contentEn") as string,
    contentAr: formData.get("contentAr") as string,
    imageUrl: formData.get("imageUrl") as string,
    category: formData.get("category") as string,
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('https://api.arabtechproserver.tech/api/blog/post', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create post: ${res.status} ${errorText}`);
  }

  revalidatePath("/[lang]/blog", "page");
  redirect("/admin/blog");
}

export async function addVideoTutorial(formData: FormData) {
  const token = cookies().get('admin_token')?.value;
  const payload = {
    titleEn: formData.get("titleEn") as string,
    titleAr: formData.get("titleAr") as string,
    youtubeId: formData.get("videoUrl") as string, // Note mapping change
    descriptionEn: "Added from admin",
    descriptionAr: "مضاف من لوحة التحكم"
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('https://api.arabtechproserver.tech/api/blog/tutorial', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create tutorial: ${res.status} ${errorText}`);
  }

  revalidatePath("/[lang]/tutorials", "page");
  redirect("/admin/blog");
}

export async function updateBlogPost(id: string, formData: FormData) {
  const token = cookies().get('admin_token')?.value;
  const payload = {
    titleEn: formData.get("titleEn") as string,
    titleAr: formData.get("titleAr") as string,
    excerptEn: formData.get("excerptEn") as string,
    excerptAr: formData.get("excerptAr") as string,
    contentEn: formData.get("contentEn") as string,
    contentAr: formData.get("contentAr") as string,
    imageUrl: formData.get("imageUrl") as string,
    category: formData.get("category") as string,
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`https://api.arabtechproserver.tech/api/blog/posts/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update post: ${res.status} ${errorText}`);
  }

  revalidatePath("/[lang]/blog", "page");
  revalidatePath(`/[lang]/blog/${id}`, "page");
}

export async function deleteBlogPost(id: string) {
  const token = cookies().get('admin_token')?.value;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`https://api.arabtechproserver.tech/api/blog/posts/${id}`, {
    method: 'DELETE',
    headers
  });

  if (!res.ok) {
    throw new Error(`Failed to delete post: ${res.status}`);
  }

  revalidatePath("/[lang]/blog", "page");
}
