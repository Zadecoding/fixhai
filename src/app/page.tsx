import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LandingPage } from "@/components/home/landing-page";
import { getCategories } from "@/app/actions/dashboard";

export default async function Home() {
  const { categories } = await getCategories();
  
  return (
    <>
      <Navbar />
      <LandingPage categories={categories} />
      <Footer />
    </>
  );
}
