import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import ChatHistory from "./components/ChatHistory";
import { jsPDF } from "jspdf";
import { FiDownload, FiMic } from "react-icons/fi";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, isTyping]);

  // 🎙️ Speech-to-Text (Improved with Permission Handling)
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = false;  // Stop after one sentence
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      console.log("🎙️ Listening...");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Transcribed:", transcript);
      setInput(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert(`Error: ${event.error}. Please check mic permissions.`);
    };

    recognitionRef.current.onend = () => {
      console.log("🎙️ Mic stopped listening.");
    };

    recognitionRef.current.start();
  };

  // 🔊 Bot's Text-to-Speech
  const handleBotSpeak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    synth.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsTyping(true);

    try {
      const response = await axios.post(
        "https://ai-chatbot-ri1l.onrender.com/api/chatbot/",
        { message: input }
      );

      const botMessage = { text: response.data.response, sender: "bot" };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        handleBotSpeak(botMessage.text);  // 🔊 Bot's response spoken out loud
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  };

  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    messages.forEach((msg, index) => {
      const text = `${msg.sender === "user" ? "You: " : "Bot: "} ${msg.text}`;
      doc.text(text, 10, 10 + index * 10);
    });

    doc.save("chat-history.pdf");
  };

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatBoxRef}>
        <ChatHistory messages={messages} />
        {isTyping && <div className="typing-indicator">Bot is typing...</div>}
      </div>

      <div className="input-box">
        <div className="input-wrapper">
          <FiMic 
            className="mic-icon" 
            onClick={startListening} 
            title="Voice Input (Speech-to-Text)" 
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... "
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <FiDownload
            className="download-icon"
            onClick={downloadChatAsPDF}
            title="Download chat as PDF"
          />
        </div>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
