// components/tools/cvss-calculator-modal.tsx
"use client";
import { useState, useEffect } from "react";
import { BaseToolModal } from "./base-tool-modal";
import { Tool } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "../ui/label";
import { Send } from "lucide-react";

interface CvssCalculatorModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

// CVSS v3.1 Metric Values
const MetricValues = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.20 },
  AC: { L: 0.77, H: 0.44 },
  PR: { N: 0.85, L: 0.62, H: 0.27 },
  UI: { N: 0.85, R: 0.62 },
  S: { U: 0, C: 1 },
  C: { H: 0.56, L: 0.22, N: 0.00 },
  I: { H: 0.56, L: 0.22, N: 0.00 },
  A: { H: 0.56, L: 0.22, N: 0.00 }
};

// Metric descriptions
const MetricDescriptions = {
  AV: {
    N: "Network (N)",
    A: "Adjacent (A)",
    L: "Local (L)",
    P: "Physical (P)"
  },
  AC: {
    L: "Low (L)",
    H: "High (H)"
  },
  PR: {
    N: "None (N)",
    L: "Low (L)",
    H: "High (H)"
  },
  UI: {
    N: "None (N)",
    R: "Required (R)"
  },
  S: {
    U: "Unchanged (U)",
    C: "Changed (C)"
  },
  C: {
    H: "High (H)",
    L: "Low (L)",
    N: "None (N)"
  },
  I: {
    H: "High (H)",
    L: "Low (L)",
    N: "None (N)"
  },
  A: {
    H: "High (H)",
    L: "Low (L)",
    N: "None (N)"
  }
};

export function CvssCalculatorModal({ tool, isOpen, onClose, onSendToChat }: CvssCalculatorModalProps) {
  const [metrics, setMetrics] = useState({
    AV: "N",
    AC: "L",
    PR: "N",
    UI: "N",
    S: "U",
    C: "H",
    I: "H",
    A: "H"
  });
  const [baseScore, setBaseScore] = useState(0);
  const [severity, setSeverity] = useState("");
  const { toast } = useToast();

  // Calculate CVSS score whenever metrics change
  useEffect(() => {
    calculateCvssScore();
  }, [metrics]);

  const calculateCvssScore = () => {
    // Get numerical values for each metric
   const av = MetricValues.AV[metrics.AV as keyof typeof MetricValues.AV];
    const ac = MetricValues.AC[metrics.AC as keyof typeof MetricValues.AC];
    const pr = MetricValues.PR[metrics.PR as keyof typeof MetricValues.PR];
    const ui = MetricValues.UI[metrics.UI as keyof typeof MetricValues.UI];
    const s = MetricValues.S[metrics.S as keyof typeof MetricValues.S];
    const c = MetricValues.C[metrics.C as keyof typeof MetricValues.C];
    const i = MetricValues.I[metrics.I as keyof typeof MetricValues.I];
    const a = MetricValues.A[metrics.A as keyof typeof MetricValues.A];

    // Calculate Exploitability
    let exploitability = 8.22 * av * ac * pr * ui;

    // Calculate Impact
    const iss = 1 - ((1 - c) * (1 - i) * (1 - a));
    let impact = 6.42 * iss;

    // Adjust impact based on Scope
    if (metrics.S === "C") {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    // Calculate Base Score
    let score = impact + exploitability;
    if (metrics.S === "C") {
      score = Math.min(1.08 * (impact + exploitability), 10);
    }

    // Round up to 1 decimal place
    score = Math.ceil(score * 10) / 10;
    if (score > 10) score = 10;

    setBaseScore(score);
    setSeverity(getSeverity(score));
  };

  const getSeverity = (score: number): string => {
    if (score >= 9.0) return "Critical";
    if (score >= 7.0) return "High";
    if (score >= 4.0) return "Medium";
    if (score > 0) return "Low";
    return "None";
  };

  const handleMetricChange = (metric: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  const handleSendResults = () => {
    if (onSendToChat) {
      const resultText = formatResults();
      onSendToChat(resultText);
      toast({
        title: "Results sent to chat",
        description: "CVSS calculation results have been shared in the chat",
      });
    }
  };

  const formatResults = (): string => {
    return `CVSS v3.1 Calculator Results\n\n` +
      `• Attack Vector: ${MetricDescriptions.AV[metrics.AV as keyof typeof MetricDescriptions.AV]}\n` +
      `• Attack Complexity: ${MetricDescriptions.AC[metrics.AC as keyof typeof MetricDescriptions.AC]}\n` +
      `• Privileges Required: ${MetricDescriptions.PR[metrics.PR as keyof typeof MetricDescriptions.PR]}\n` +
      `• User Interaction: ${MetricDescriptions.UI[metrics.UI as keyof typeof MetricDescriptions.UI]}\n` +
      `• Scope: ${MetricDescriptions.S[metrics.S as keyof typeof MetricDescriptions.S]}\n` +
      `• Confidentiality Impact: ${MetricDescriptions.C[metrics.C as keyof typeof MetricDescriptions.C]}\n` +
      `• Integrity Impact: ${MetricDescriptions.I[metrics.I as keyof typeof MetricDescriptions.I]}\n` +
      `• Availability Impact: ${MetricDescriptions.A[metrics.A as keyof typeof MetricDescriptions.A]}\n\n` +
      `Base Score: ${baseScore} (${severity})`;
  };

  const MetricButtonGroup = ({ 
    metric, 
    title 
  }: { 
    metric: keyof typeof MetricValues, 
    title: string 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(MetricDescriptions[metric]).map(([key, desc]) => (
          <Button
            key={key}
            variant={metrics[metric] === key ? "default" : "outline"}
            size="sm"
            onClick={() => handleMetricChange(metric, key)}
          >
            {desc}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <BaseToolModal tool={tool} isOpen={isOpen} onClose={onClose}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>CVSS v3.1 Calculator</CardTitle>
            <CardDescription>
              Calculate Common Vulnerability Scoring System base scores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Exploitability Metrics</h3>
                <MetricButtonGroup metric="AV" title="Attack Vector (AV)" />
                <MetricButtonGroup metric="AC" title="Attack Complexity (AC)" />
                <MetricButtonGroup metric="PR" title="Privileges Required (PR)" />
                <MetricButtonGroup metric="UI" title="User Interaction (UI)" />
                <MetricButtonGroup metric="S" title="Scope (S)" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Impact Metrics</h3>
                <MetricButtonGroup metric="C" title="Confidentiality Impact (C)" />
                <MetricButtonGroup metric="I" title="Integrity Impact (I)" />
                <MetricButtonGroup metric="A" title="Availability Impact (A)" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-medium">CVSS Base Score</h4>
      <p className="text-sm text-gray-400">Calculated in real-time</p>
    </div>
    <div className="text-right">
      <div className="text-3xl font-bold">{baseScore.toFixed(1)}</div>
      <Badge 
        className={
          severity === "Critical" ? "bg-red-500/20 text-red-500" :
          severity === "High" ? "bg-orange-500/20 text-orange-500" :
          severity === "Medium" ? "bg-yellow-500/20 text-yellow-500" : 
          severity === "Low" ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
        }
        variant="outline"
      >
        {severity}
      </Badge>
    </div>
  </div>
</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onSendToChat && (
              <Button onClick={handleSendResults}>
                <Send className="mr-2 h-4 w-4" />
                Send Results to Chat
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </BaseToolModal>
  );
}