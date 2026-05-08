import {
  ArrowRight,
  Blocks,
  FileCheck2,
  HandHeart,
  Hash,
  PencilLine,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { campaigns } from "../data/mockData";

const money = (value) => `\u09f3${value.toLocaleString("en-BD")}`;
const statCards = ["\u09f32.5 Crore Raised", "12,400 Donors", "340 Campaigns"];

export default function Home() {
  return (
    <div className="space-y-12 pb-3">
      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-green-50 to-green-100 p-6 shadow-soft sm:p-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            আপনার সাহায্য পরিবর্তন আনে
          </h1>
          <p className="mt-4 text-sm text-slate-600 sm:text-base">
            Transparent, verifiable donations for causes that matter in Bangladesh
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button size="lg">Start a Campaign</Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline">
                Explore Campaigns
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat} className="rounded-xl border-0 bg-white/90 p-4">
              <p className="text-sm font-semibold text-primary">{stat}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works">
        <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Create a Campaign",
              icon: PencilLine,
              text: "Start your fundraiser with a clear goal and story.",
            },
            {
              title: "Share your unique link or QR code",
              icon: Share2,
              text: "Spread your campaign across social channels instantly.",
            },
            {
              title: "Receive transparent donations",
              icon: HandHeart,
              text: "Track every contribution with verifiable transparency.",
            },
          ].map((step, index) => (
            <Card key={step.title} className="rounded-2xl">
              <step.icon className="text-primary" size={22} />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">
                Step {index + 1}
              </p>
              <h3 className="mt-1 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Campaigns</h2>
          <Link to="/explore" className="inline-flex items-center text-sm font-medium text-primary">
            See all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {campaigns.slice(0, 3).map((campaign) => {
            const funded = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100);
            return (
              <Card key={campaign.id} className="overflow-hidden rounded-2xl p-0">
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-green-100 to-emerald-200 text-sm font-semibold text-primary">
                  {campaign.imageLabel}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {campaign.category}
                    </span>
                    <span className="text-xs text-slate-500">{campaign.location}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">{campaign.title}</h3>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${funded}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {funded}% funded • {money(campaign.raisedAmount)} raised of{" "}
                    {money(campaign.targetAmount)} goal
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{campaign.daysLeft} days left</span>
                    <Link to={`/donate/${campaign.id}`}>
                      <Button size="default">Donate Now</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Why trust Orpon?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Hash-chain verified records",
              desc: "Each transaction is cryptographically connected for integrity.",
              icon: Hash,
            },
            {
              title: "Blockchain anchored",
              desc: "Donation snapshots are anchored for tamper-resistant proof.",
              icon: Blocks,
            },
            {
              title: "Public audit trail",
              desc: "Everyone can verify donation flow and campaign transparency.",
              icon: FileCheck2,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-slate-50 p-4">
              <item.icon className="text-primary" size={20} />
              <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-primary p-6 text-white shadow-soft sm:p-8">
        <h2 className="text-2xl font-bold">Ready to make a difference?</h2>
        <p className="mt-2 text-sm text-white/90">
          Launch your fundraiser and share hope with complete transparency.
        </p>
        <div className="mt-4">
          <Link to="/dashboard">
            <Button variant="secondary" size="lg">
              Start Campaign
            </Button>
            </Link>
        </div>
      </section>
    </div>
  );
}
