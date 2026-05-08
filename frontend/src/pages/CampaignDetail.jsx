import { Link, useParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { campaigns } from "../data/mockData";

const money = (value) => `\u09f3${value.toLocaleString("en-BD")}`;

export default function CampaignDetail() {
  const { id } = useParams();
  const campaign = campaigns.find((item) => item.id === id);

  if (!campaign) {
    return <p className="text-sm text-slate-600">Campaign not found.</p>;
  }

  return (
    <Card>
      <p className="text-sm text-slate-500">{campaign.category}</p>
      <h1 className="mt-1 text-2xl font-bold">{campaign.title}</h1>
      <p className="mt-4 text-sm text-slate-700">{campaign.story}</p>
      <div className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <p>Raised: {money(campaign.raisedAmount)}</p>
        <p>Goal: {money(campaign.targetAmount)}</p>
        <p>Donors: {campaign.donors}</p>
      </div>
      <Link to={`/donate/${campaign.id}`} className="mt-5 inline-block text-primary">
        Donate now
      </Link>
    </Card>
  );
}
