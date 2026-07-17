import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSend,
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiTrash2,
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar";
import { useUser } from "../context/UserContext";
import "../styles/aiCareerCoach.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function AICareerCoach() {
  const { user } = useUser();

  const welcomeMessage = useMemo(
    () => ({
      role: "ai",
      text: `Hi ${user?.name || "User"} 👋 Main tumhara AI Career Assistant hoon. Resume, interview, roadmap ya jobs ke baare me pooch sakte ho.`,
      chatId: null,
    }),
    [user?.name]
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [likedChatId, setLikedChatId] = useState(null);
  const [dislikedChatId, setDislikedChatId] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages((currentMessages) => {
      if (currentMessages.length === 0) {
        return [welcomeMessage];
      }

      const onlyWelcomeMessage =
        currentMessages.length === 1 &&
        currentMessages[0]?.role === "ai" &&
        currentMessages[0]?.chatId === null;

      return onlyWelcomeMessage ? [welcomeMessage] : currentMessages;
    });
  }, [welcomeMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  const getToken = () => localStorage.getItem("token");

  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/ai-chats`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat history load nahi hui.");
      }

      setHistory(Array.isArray(data.chats) ? data.chats : []);
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const startNewChat = () => {
    setSelectedChat(null);
    setInput("");
    setCopiedIndex(null);
    setLikedChatId(null);
    setDislikedChatId(null);
    setMessages([welcomeMessage]);
  };

  const openHistoryChat = (chat) => {
    setSelectedChat(chat);
    setInput("");
    setCopiedIndex(null);

    setLikedChatId(chat.liked ? chat.id : null);
    setDislikedChatId(chat.disliked ? chat.id : null);

    setMessages([
      {
        role: "user",
        text: chat.question || "Question not available",
        chatId: chat.id,
      },
      {
        role: "ai",
        text: chat.answer || "Answer not available",
        chatId: chat.id,
      },
    ]);
  };

  const copyText = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedIndex(index);

    window.setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const saveFeedback = async (chatId, type) => {
  if (!chatId) {
    console.error("Chat ID missing");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/ai-chats/${chatId}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Feedback save nahi hua");
    }

    if (type === "like") {
      setLikedChatId((current) =>
        current === chatId ? null : chatId
      );
      setDislikedChatId(null);
    }

    if (type === "dislike") {
      setDislikedChatId((current) =>
        current === chatId ? null : chatId
      );
      setLikedChatId(null);
    }

    setHistory((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              liked: type === "like",
              disliked: type === "dislike",
            }
          : chat
      )
    );
  } catch (error) {
    console.error("Feedback error:", error);
  }
};
  const deleteHistoryChat = async (event, chatId) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Kya aap is chat ko delete karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/ai-chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat delete nahi hui.");
      }

      setHistory((previousHistory) =>
        previousHistory.filter((chat) => chat.id !== chatId)
      );

      if (selectedChat?.id === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error("Delete chat error:", error);
    }
  };

  const sendMessage = async () => {
    const userText = input.trim();

    if (!userText || isTyping) return;

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        text: userText,
        chatId: null,
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || data.message || "AI request failed.");
      }

      const reply = data.reply || "AI response empty hai.";

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text: reply,
          chatId: data.chat?.id || data.chat_id || null,
        },
      ]);

      setSelectedChat(null);
      await fetchHistory();
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text: error.message || "Server error. Please try again.",
          chatId: null,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="ai-box">
            <div className="ai-workspace">
              <aside className="ai-history-sidebar">
                <button
                  type="button"
                  className="new-chat-btn"
                  onClick={startNewChat}
                >
                  + New Chat
                </button>

                <div className="history-heading">
                  <h6>Recent Chats</h6>
                  <span>{history.length}</span>
                </div>

                {historyLoading ? (
                  <p className="empty-history">Loading chats...</p>
                ) : history.length === 0 ? (
                  <p className="empty-history">No chats yet</p>
                ) : (
                  <div className="history-list">
                    {history.map((chat) => (
                      <div
                        key={chat.id}
                        role="button"
                        tabIndex={0}
                        className={`history-item ${
                          selectedChat?.id === chat.id ? "active-history" : ""
                        }`}
                        onClick={() => openHistoryChat(chat)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            openHistoryChat(chat);
                          }
                        }}
                      >
                        <span className="history-icon"></span>

                        <div className="history-text">
                          <p>{chat.question || "Untitled chat"}</p>
                          
                        </div>

                        <button
                          type="button"
                          className="history-delete-btn"
                          aria-label="Delete chat"
                          onClick={(event) =>
                            deleteHistoryChat(event, chat.id)
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </aside>

              <section className="ai-chat-section">
                <div className="ai-top">
                  <div>
                    <h2>🤖 AI Career Assistant</h2>
                    
                  </div>

                  <span>Online</span>
                </div>

                <div className="ai-suggestion-box">
                  <button
                    type="button"
                    onClick={() =>
                      setInput("Create a web developer roadmap")
                    }
                  >
                    Web Developer Roadmap
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInput("Give me interview tips for fresher")
                    }
                  >
                    Interview Tips
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInput("How can I improve my resume?")
                    }
                  >
                    Resume Improve
                  </button>
                </div>

                <div className="ai-chat-area">
                  {messages.map((message, index) => {
                    const isAi = message.role === "ai";
                    const messageChatId =
                      message.chatId || selectedChat?.id || null;

                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={`chat-row ${
                          message.role === "user" ? "user" : "ai"
                        }`}
                      >
                        <div className="chat-avatar">
                          {message.role === "user"
                            ? user?.name?.charAt(0)?.toUpperCase() || "U"
                            : "🤖"}
                        </div>

                        <div className="chat-content">
                          <div className="chat-bubble">
                            {isAi && (
                              <div className="assistant-top">
                                <strong>StudentAI Assistant</strong>

                                <button
                                  type="button"
                                  aria-label="Copy response"
                                  onClick={() =>
                                    copyText(message.text, index)
                                  }
                                >
                                  {copiedIndex === index ? (
                                    <span>Copied</span>
                                  ) : (
                                    <FiCopy />
                                  )}
                                </button>
                              </div>
                            )}

                            <ReactMarkdown>
                              {message.text}
                            </ReactMarkdown>
                          </div>

                          {isAi && (
                            <div className="chat-actions">
                              <button
                                type="button"
                                className={
                                  copiedIndex === index
                                    ? "active-action"
                                    : ""
                                }
                                onClick={() =>
                                  copyText(message.text, index)
                                }
                              >
                                <FiCopy />
                                {copiedIndex === index && (
                                  <span>Copied</span>
                                )}
                              </button>

                              <button
                                type="button"
                                className={
                                  likedChatId === messageChatId
                                    ? "active-action"
                                    : ""
                                }
                                disabled={!messageChatId}
                                onClick={() =>
                                  saveFeedback(messageChatId, "like")
                                }
                              >
                                <FiThumbsUp />
                              </button>

                              <button
                                type="button"
                                className={
                                  dislikedChatId === messageChatId
                                    ? "active-action"
                                    : ""
                                }
                                disabled={!messageChatId}
                                onClick={() =>
                                  saveFeedback(messageChatId, "dislike")
                                }
                              >
                                <FiThumbsDown />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="chat-row ai">
                      <div className="chat-avatar">🤖</div>

                      <div className="chat-content">
                        <div className="chat-bubble typing">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef}></div>
                </div>

                <div className="ai-input-area">
                  <textarea
                    rows="1"
                    placeholder="Ask your career question..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                  />

                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={isTyping || !input.trim()}
                    aria-label="Send message"
                  >
                    <FiSend />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}