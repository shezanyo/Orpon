import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function Donate() {
  const { id } = useParams();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccess(true);
  };

  return (
    <Card className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold">Donate to campaign</h1>
      <p className="mt-1 text-sm text-slate-600">Campaign ID: {id}</p>
      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Donor name (optional)" />
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in BDT"
          type="number"
          min="1"
          required
        />
        <Button className="w-full" type="submit">
          Donate
        </Button>
      </form>
      {success && <p className="mt-4 text-sm text-primary">Donation simulated successfully on Orpon.</p>}
    </Card>
  );
}
