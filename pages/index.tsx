import { useEffect, useRef, useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: input,
        stream: false,
      }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => setMessages([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="text-2xl font-bold mb-4">Llama3 Chat (via Ollama)</div>
      <div className="w-full max-w-2xl flex flex-col gap-2 overflow-y-auto flex-1 mb-4 bg-gray-800 p-4 rounded-xl">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'}`}
          >
            {msg.content}
            <button
              onClick={() => navigator.clipboard.writeText(msg.content)}
              className="ml-2 text-xs underline text-gray-300 hover:text-white"
            >
              คัดลอก
            </button>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full max-w-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความแล้วกด Enter..."
          className="w-full p-3 rounded-lg bg-gray-700 text-white resize-none h-24 focus:outline-none"
        />
        <div className="flex justify-between mt-2">
          <button
            onClick={sendMessage}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'กำลังตอบ...' : 'ส่งข้อความ'}
          </button>
          <button
            onClick={resetChat}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            รีเซ็ต
          </button>
        </div>
      </div>
    </div>
  );
}
