import Hero from "../components/Hero";
import Features from "../components/Features";

import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import FAQSchema from "../components/FAQSchema";

export default function Home() {
return (
<>
{/* SEO Meta Tags */} <SEO />


  {/* Google Structured Data */}
  <StructuredData />

  {/* FAQ Schema */}
  <FAQSchema />

  {/* Hero Section */}
  <main>
    <Hero />

    {/* Features Section */}
    <Features />
  </main>
</>


);
}
