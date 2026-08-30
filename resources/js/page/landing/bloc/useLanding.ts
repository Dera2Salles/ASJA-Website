import type { ChatDto } from '@/features/chat/chat.dto';
import { chatGemini } from '@/injection';
import { useEffect, useRef, useState } from 'react';

/**
 * État du chatbot de la page d'accueil.
 *
 * Les événements et les annonces ne transitent plus par ici : ils sont fournis
 * par le serveur via les props Inertia. Les appels Strapi qui les alimentaient
 * pointaient vers une adresse invalide et échouaient à chaque chargement.
 */
export const useLanding = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messagesList, setMessagesList] = useState<ChatDto[]>([
        {
            message: `Bonjour! Je suis ASJABOT, votre assistant virtuel pour l'université ASJA. 😊 Comment puis-je vous aider aujourd'hui ? Que cherchez-vous à savoir sur nos événements, les adhésions, ou toute autre information concernant l'université ?`,
            expediteur: 'Bot',
        },
    ]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const refFinMessages = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        refFinMessages.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messagesList]);

    const sendMessage = async (messageText?: string) => {
        const messageToSend = messageText || message.trim();
        if (!messageToSend) return;

        setMessagesList((prev) => [
            ...prev,
            { message: messageToSend, expediteur: 'User' },
        ]);
        setLoading(true);
        if (!messageText) {
            setMessage('');
        }
        const result = await chatGemini.send(messageToSend);

        if (result.status == 'success') {
            setMessagesList((prev) => [
                ...prev,
                { message: result.data.message, expediteur: 'Bot' },
            ]);
        }

        if (result.status == 'failure') {
            setMessagesList((prev) => [
                ...prev,
                {
                    message: 'Error occured on sending message',
                    expediteur: 'Bot',
                },
            ]);
        }

        setLoading(false);
    };

    return {
        loading,
        isOpen,
        messagesList,
        sendMessage,
        setIsOpen,
        message,
        setMessage,
        refFinMessages,
    };
};
