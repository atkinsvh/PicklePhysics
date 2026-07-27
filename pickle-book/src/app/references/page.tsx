import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "References",
  description: "References and citations for Ed's Picklery and Emporium",
};
export default function ReferencesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">References</h1>
      <div className="prose">
        <h2>Academic Sources</h2>
        <ol>
          <li>
            Marco, M.L., et al. (2017). &ldquo;Health benefits of fermented foods: microbiota and beyond.&rdquo;
            <em>Current Opinion in Biotechnology</em>, 44, 94–102.
          </li>
          <li>
            Pandey, K.R., et al. (2015). &ldquo;Probiotics, prebiotics and synbiotics — a review.&rdquo;
            <em>Journal of Food Science and Technology</em>, 52(12), 7577–7587.
          </li>
          <li>
            Breidt, F., et al. (2007). &ldquo;Fermented vegetables.&rdquo;
            <em>Food Microbiology: Fundamentals and Frontiers</em>, 3rd edition.
          </li>
        </ol>
        <h2>Historical References</h2>
        <ol start={4}>
          <li>
            Harrison, M. (2004). &ldquo;Food and Medicine in Roman Antiquity.&rdquo;
            <em>Cambridge University Press</em>.
          </li>
          <li>
            Davidson, A. (2014). <em>The Oxford Companion to Food</em>. Oxford University Press.
          </li>
        </ol>
        <h2>Food Safety</h2>
        <ol start={6}>
          <li>
            USDA. (2015). <em>Complete Guide to Home Canning</em>. Agriculture Information Bulletin No. 539.
          </li>
          <li>
            National Center for Home Food Preservation. (2023). Methods for pickling vegetables.
            <em>NCHFP Guide</em>.
          </li>
        </ol>
      </div>
    </div>
  );
}
