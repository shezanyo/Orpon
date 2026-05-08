import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    login(email);
    navigate("/dashboard");
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-xl font-bold">Login to Orpon</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <Input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button className="w-full" type="submit">
          Continue
        </Button>
      </form>
    </Card>
  );
}
