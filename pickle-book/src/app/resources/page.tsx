import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resources",
  description: "Additional resources for Ed's Picklery and Emporium",
};
export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Resources</h1>
      <div className="prose">
        <h2>Recommended Reading</h2>
        <ul>
          <li><strong>The Art of Fermentation</strong> by Sandor Ellix Katz — the definitive guide to fermentation techniques</li>
          <li><strong>Preserving by the Pint</strong> by Marisa McClellan — small-batch preserving for beginners</li>
          <li><strong>Animal, Vegetable, Miracle</strong> by Barbara Kingsolver — a memoir about seasonal eating</li>
        </ul>
        <h2>Equipment Suppliers</h2>
        <ul>
          <li>Quality canning jars and lids</li>
          <li>Kitchen scales with 0.1g precision</li>
          <li>pH testing strips and meters</li>
          <li>Non-reactive pots and utensils</li>
        </ul>
        <h2>Food Safety References</h2>
        <ul>
          <li>National Center for Home Food Preservation (NCHFP)</li>
          <li>USDA Complete Guide to Home Canning</li>
          <li>Local cooperative extension services</li>
        </ul>
        <h2>Online Communities</h2>
        <ul>
          <li>r/Fermentation — active community of home fermenters</li>
          <li>Homebrewtalk forums — extensive pickling and fermentation threads</li>
          <li>Local food preservation groups and workshops</li>
        </ul>
      </div>
    </div>
  );
}
