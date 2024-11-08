import { useState, useEffect } from "react";
import { get_encoding } from "tiktoken";

const encoding = get_encoding("p50k_base");

const App = () => {
  const [input, setInput] = useState("Testy testy woo");
  const [segments, setSegments] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [customBinary, setCustomBinary] = useState(null);

  useEffect(() => {
    const encodedTokens = encoding.encode(input);
    setTokens(encodedTokens);
    const wordSegments = [];
    encodedTokens.forEach(token => {
      const bytes = encoding.decode([token]);
      const segment = new TextDecoder().decode(bytes);
      wordSegments.push(segment);
    });
    setSegments(wordSegments);
    setSelectedIndex(null);
    setCustomBinary(null);
  }, [input]);

  const handleTokenClick = (index) => {
    setSelectedIndex(selectedIndex === index ? null : index);
    setCustomBinary(null);
  };

  const handleBitClick = (bitIndex) => {
    // If we're currently showing a selected token, start with that binary
    const currentBinary = customBinary || 
      (selectedIndex !== null ? tokens[selectedIndex].toString(2).padStart(16, '0') : '0'.repeat(16));
    
    // Toggle the bit at the clicked position
    const newBinary = currentBinary.split('');
    newBinary[bitIndex] = newBinary[bitIndex] === '1' ? '0' : '1';
    const newBinaryString = newBinary.join('');
    
    // Convert binary to decimal
    const newDecimal = parseInt(newBinaryString, 2);
    
    try {
      // Try to decode the new token number
      const bytes = encoding.decode([newDecimal]);
      const newSegment = new TextDecoder().decode(bytes);
      if (bytes && newSegment){
        setCustomBinary(newBinaryString);
        setSelectedIndex(null);
      }
    } catch (e) {
      // If decoding fails, the binary value is too big
    }
  };

  const getBinaryGrid = () => {
    if (customBinary) return customBinary.split('');
    if (selectedIndex === null) return Array(16).fill('0');
    const tokenNum = tokens[selectedIndex];
    return tokenNum.toString(2).padStart(16, '0').split('');
  };

  const getCurrentDisplay = () => {
    if (customBinary) {
      const decimal = parseInt(customBinary, 2);
      try {
        const bytes = encoding.decode([decimal]);
        const segment = new TextDecoder().decode(bytes);
        return `${segment} (${decimal})`;
      } catch (e) {
        return `Invalid token (${decimal})`;
      }
    }
    if (selectedIndex === null) return "Click a square below or one of the segments above";
    return `${segments[selectedIndex]} (${tokens[selectedIndex]})`;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter text to tokenize..."
      />
      <div className="space-y-4">
        <div className="font-bold">Word Segments:</div>
        <div className="flex flex-wrap gap-2">
          {segments.map((segment, index) => {
            const tokenString = tokens[index].toString();
            const maxWidth = Math.max(
              segment.length * 12,
              tokenString.length * 18
            );
            return (
              <span
                key={index}
                onClick={() => handleTokenClick(index)}
                className={`px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 whitespace-pre
                  transition-all duration-200 cursor-pointer text-center ${
                    selectedIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                style={{ minWidth: `${maxWidth}px` }}
              >
                {selectedIndex === index ? tokenString : segment}
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-8 w-full flex gap-4 flex-col items-center">
        <div className="w-full">
          <p><strong>Binary Representation:</strong> {getCurrentDisplay()}</p>
        </div>
        <div className="grid grid-cols-4 gap-4 w-full max-w-xl">
          {getBinaryGrid().map((bit, index) => (
            <div
              key={index}
              onClick={() => handleBitClick(index)}
              className={`aspect-square rounded-md transition-colors duration-200 cursor-pointer
                ${bit === '1' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;