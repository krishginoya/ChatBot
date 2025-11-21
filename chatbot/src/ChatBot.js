import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const API_KEY = '';
  const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = async (userMessage) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful and friendly chatbot assistant. Keep your responses concise and conversational.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I didn't get a response. Can you try again?";
    } catch (error) {
      console.error('Error calling API:', error);
      
      // Fallback to basic responses if API fails
      const lowerCaseMessage = userMessage.toLowerCase();
      
      if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        return "Hello there! How can I assist you today?";
      } else if (lowerCaseMessage.includes('help')) {
        return "I'm here to help! You can ask me about various topics or just chat with me.";
      } else if (lowerCaseMessage.includes('bye') || lowerCaseMessage.includes('goodbye')) {
        return "Goodbye! Feel free to come back if you have more questions!";
      } else if (lowerCaseMessage.includes('thank')) {
        return "You're welcome! Is there anything else I can help with?";
      } else if (lowerCaseMessage.includes('name')) {
        return "I'm ChatBot, your friendly AI assistant!";
      } else {
        return "I'm having trouble connecting to my AI brain right now. Could you try again in a moment?";
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const botResponseText = await getBotResponse(inputMessage);
      
      const botResponse = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error handling message:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm experiencing some technical difficulties. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>AI ChatBot Assistant</h3>
        <div className="status-indicator"></div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chatbot-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="message-input"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={inputMessage.trim() === '' || isTyping}
            className="send-button"
          >
            {isTyping ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;