
import { Button } from "@/components/ui/button";

interface SampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SampleQuestions({ onSelectQuestion }: SampleQuestionsProps) {
  const questions = [
    "Who is Harry Potter?",
    "Explain the plot of the Prisoner of Azkaban",
    "What happened at the Triwizard Tournament?",
    "Tell me about Albus Dumbledore",
    "What is the significance of the Chamber of Secrets?",
    "How did Harry get his scar?"
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-hogwarts-red">Sample Questions</h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            onClick={() => onSelectQuestion(question)}
            className="border-hogwarts-gold/30 hover:bg-hogwarts-gold/10 text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
