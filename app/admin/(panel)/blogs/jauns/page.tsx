import { getAllProducts } from "@/lib/catalog";
import BlogEditor, { type BlogProduct } from "../blog-editor";

export const dynamic = "force-dynamic";

export default async function JaunsBlogPage() {
  const products = await getAllProducts();
  const list: BlogProduct[] = products.map((p) => ({ slug: p.slug, name: p.name }));
  return <BlogEditor products={list} />;
}
