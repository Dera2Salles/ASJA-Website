import { Bot, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useLandingContext } from '../bloc/useLandingContext';
import { useScrollLock } from '../hooks/useScrollLock';
import PromptSuggestions from './suggestion-bot';

const Chatbot: React.FC = () => {
    const {
        setIsOpen,
        isOpen,
        messagesList,
        loading,
        message,
        sendMessage,
        setMessage,
        refFinMessages,
    } = useLandingContext();

    useScrollLock(isOpen);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleResize = () => {
            const visualViewport = window.visualViewport;
            if (!visualViewport) return;

            const isKeyboardOpen =
                visualViewport.height < window.innerHeight * 0.8;
            setKeyboardVisible(isKeyboardOpen);

            if (isKeyboardOpen && formRef.current) {
                setTimeout(() => {
                    refFinMessages.current?.scrollIntoView({
                        behavior: 'smooth',
                    });
                }, 100);
            }
        };

        const handleFocusIn = () => {
            setTimeout(() => {
                handleResize();
            }, 150);
        };

        const handleFocusOut = () => {
            setTimeout(() => {
                setKeyboardVisible(false);
            }, 150);
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        const inputElement = inputRef.current;
        if (inputElement) {
            inputElement.addEventListener('focusin', handleFocusIn);
            inputElement.addEventListener('focusout', handleFocusOut);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener(
                    'resize',
                    handleResize,
                );
            }
            if (inputElement) {
                inputElement.removeEventListener('focusin', handleFocusIn);
                inputElement.removeEventListener('focusout', handleFocusOut);
            }
        };
    }, [isOpen, refFinMessages]);

    useEffect(() => {
        if (messagesList.length > 0 || loading) {
            setTimeout(() => {
                refFinMessages.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }, 100);
        }
    }, [messagesList, loading, refFinMessages]);

    return (
        <div className="fixed right-4 bottom-4 z-[1000] font-sans">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-primary-foreground border-border hover:bg-background hover:text-primary cursor-pointer border p-4"
                >
                    <Bot size={32} />
                </button>
            )}

            {isOpen && (
                <div
                    className={`fixed inset-0 z-[1001] flex flex-col border-border bg-background transition-all duration-300 sm:absolute sm:inset-auto sm:right-0 sm:bottom-0 sm:h-[500px] sm:w-96 sm:border ${keyboardVisible ?'pb-0' : ''} `}
                >
                    <div className="border-border flex w-full flex-shrink-0 items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
                        <section className="flex items-center gap-2">
                            <div className="relative">
                                <Bot
                                    className="border-border border p-1"
                                    size={35}
                                />
                                <span className="border-background absolute right-0 bottom-0 block h-2.5 w-2.5 border bg-foreground"></span>
                            </div>
                            <span className="text-lg font-semibold">
                                ASJABot
                            </span>
                        </section>
                        <MdCancel
                            onClick={() => setIsOpen(false)}
                            className="cursor-pointer text-2xl transition-all duration-300 hover:scale-125 hover:rotate-90"
                        />
                    </div>
                    <div
                        className={`flex flex-1 flex-col space-y-3 overflow-y-auto p-4 ${keyboardVisible ?'pb-2' : ''} `}
                    >
                        {messagesList.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                                <div className="rounded-full bg-accent p-4">
                                    <Bot
                                        size={40}
                                        className="text-primary"
                                    />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-foreground">
                                    ASJABot à votre service
                                </h2>
                                <p className="mt-1 max-w-[80%] text-sm text-muted-foreground">
                                    Posez-moi des questions sur l'université,
                                    les admissions, ou la vie étudiante.
                                </p>
                            </div>
                        ) : (
                            messagesList.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`max-w-[85%] rounded-lg px-4 py-2 text-sm break-words shadow-sm transition-all duration-300 ${ msg.expediteur ==='User'
                                            ? 'self-end rounded-br-none bg-primary text-white'
                                            : 'self-start rounded-bl-none bg-card text-foreground '
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex items-center space-x-2 self-start">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-muted"></div>
                            </div>
                        )}
                        <div ref={refFinMessages} />
                    </div>
                    {messagesList.length === 1 ? (
                        <PromptSuggestions
                            onSelect={async (text) => {
                                await sendMessage(text);
                            }}
                        />
                    ) : null}
                    <form
                        ref={formRef}
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                        className={`flex flex-shrink-0 items-center rounded-b-2xl border-t border-border bg-card p-3 transition-all duration-300 ${keyboardVisible ?'pb-4' : ''} `}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Posez votre question..."
                            disabled={loading}
                            className="w-full flex-1 border-none bg-transparent text-foreground placeholder-muted focus:ring-0 focus:outline-none disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="rounded-full bg-primary p-2.5 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-primary disabled:scale-100 disabled:cursor-not-allowed disabled:bg-primary/50"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
