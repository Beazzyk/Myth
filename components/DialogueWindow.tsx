import React, { useState } from 'react';

interface DialogueWindowProps {
  npc: {
    name: string;
    dialogue?: string[];
  };
  onClose: () => void;
}

const DialogueWindow: React.FC<DialogueWindowProps> = ({ npc, onClose }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const dialogue = npc.dialogue || ["Witaj, podróżniku!", "Czy mogę ci w czymś pomóc?", "Do zobaczenia!"];

  const handleNext = () => {
    if (currentLine < dialogue.length - 1) {
      setCurrentLine(currentLine + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-blue-800 text-white p-4 h-80">
      <div className="mb-4">
        <span className="font-bold">{npc.name}:</span> {dialogue[currentLine]}
      </div>
      <div className="flex justify-between">
        <button 
          onClick={handleNext} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {currentLine < dialogue.length - 1 ? "Dalej" : "Zakończ rozmowę"}
        </button>
      </div>
    </div>
  );
};

export default DialogueWindow;