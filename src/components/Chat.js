import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const scrollViewRef = useRef();
    const ws = useRef(null);

    useEffect(() => {
        // Conectar al WebSocket
        ws.current = new WebSocket('ws://tu-servidor:3000');

        ws.current.onopen = () => {
            console.log('Conectado al WebSocket');
            setIsConnected(true);
        };

        ws.current.onclose = () => {
            console.log('Desconectado del WebSocket');
            setIsConnected(false);
        };

        ws.current.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'message') {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];

                    if (lastMessage && lastMessage.role === 'assistant') {
                        lastMessage.content += data.content;
                        return [...newMessages];
                    } else {
                        return [...newMessages, { role: 'assistant', content: data.content }];
                    }
                });
            } else if (data.type === 'end') {
                setIsLoading(false);
            } else if (data.type === 'error') {
                setMessages(prev => [...prev, { role: 'error', content: data.content }]);
                setIsLoading(false);
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const sendMessage = () => {
        if (!inputMessage.trim() || !isConnected) return;

        const userMessage = inputMessage;
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        ws.current.send(JSON.stringify({
            message: userMessage
        }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.statusBar}>
                <Text style={styles.statusText}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                </Text>
            </View>
            <ScrollView
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                style={styles.messagesContainer}
            >
                {messages.map((message, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageBubble,
                            message.role === 'user' ? styles.userBubble :
                                message.role === 'error' ? styles.errorBubble :
                                    styles.assistantBubble,
                        ]}
                    >
                        <Text style={[
                            styles.messageText,
                            message.role === 'user' ? styles.userMessageText :
                                message.role === 'error' ? styles.errorMessageText :
                                    styles.assistantMessageText
                        ]}>
                            {message.content}
                        </Text>
                    </View>
                ))}
                {isLoading && (
                    <View style={styles.loadingBubble}>
                        <Text style={styles.messageText}>...</Text>
                    </View>
                )}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    placeholder="Escribe tu mensaje..."
                    multiline
                    editable={isConnected}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !isConnected && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!isConnected || isLoading}
                >
                    <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    statusBar: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        color: '#666',
    },
    messagesContainer: {
        flex: 1,
        padding: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E5EA',
    },
    errorBubble: {
        alignSelf: 'center',
        backgroundColor: '#FFE5E5',
    },
    loadingBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E5EA',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    messageText: {
        color: '#000',
    },
    userMessageText: {
        color: '#fff',
    },
    errorMessageText: {
        color: '#FF0000',
    },
    assistantMessageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Chat; 