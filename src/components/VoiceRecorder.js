import React, { useState, useRef } from 'react';
import { addVoiceToScreenshot } from '../services/api';

function VoiceRecorder({ userId, screenshotId, onUpload }) {
    const [voiceFile, setVoiceFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [uploading, setUploading] = useState(false);

    const audioRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const chunks = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                const file = new File([audioBlob], `voice_${screenshotId}_${Date.now()}.wav`, { type: 'audio/wav' });
                setVoiceFile(file);

                // Create audio URL for preview
                const url = URL.createObjectURL(audioBlob);
                if (audioRef.current) {
                    audioRef.current.src = url;
                }

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(1000);
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (error) {
            console.error('Microphone error:', error);
            alert('Microphone access denied or error: ' + error.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && recording) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const handlePlay = () => {
        if (audioRef.current && audioRef.current.src) {
            audioRef.current.play();
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleUpload = async () => {
        if (!voiceFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('voice', voiceFile);
        formData.append('isUserVoice', 'true');

        try {
            await addVoiceToScreenshot(userId, screenshotId, formData);
            alert('Voice note added successfully!');
            setVoiceFile(null);
            if (audioRef.current) {
                audioRef.current.src = '';
            }
            onUpload();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const cancelRecording = () => {
        setVoiceFile(null);
        if (audioRef.current) {
            audioRef.current.src = '';
        }
    };

    return (
        <div style={styles.container}>
            {!voiceFile ? (
                <div>
                    {!recording ? (
                        <button onClick={startRecording} style={styles.recordButton} disabled={uploading}>
                            🎤 Record Voice Note
                        </button>
                    ) : (
                        <div>
                            <button onClick={stopRecording} style={styles.stopButton}>
                                ⏹️ Stop Recording
                            </button>
                            <span style={styles.recordingText}> 🔴 Recording...</span>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div style={styles.previewContainer}>
                        <audio
                            ref={audioRef}
                            controls
                            style={styles.audioPlayer}
                        />
                        <div style={styles.previewButtons}>
                            <button onClick={handlePlay} style={styles.playButton}>
                                ▶️ Play Recording
                            </button>
                            <button onClick={handlePause} style={styles.pauseButton}>
                                ⏸️ Pause
                            </button>
                        </div>
                    </div>

                    <div style={styles.actionButtons}>
                        <button onClick={handleUpload} style={styles.uploadButton} disabled={uploading}>
                            {uploading ? 'Uploading...' : '📤 Upload Voice Note'}
                        </button>
                        <button onClick={cancelRecording} style={styles.cancelButton}>
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { marginTop: '10px' },
    recordButton: { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '8px 12px', margin: '5px', borderRadius: '5px', cursor: 'pointer', width: '100%' },
    stopButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', margin: '5px', borderRadius: '5px', cursor: 'pointer' },
    recordingText: { color: 'red', fontSize: '12px', marginLeft: '10px' },
    previewContainer: { margin: '10px 0', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' },
    audioPlayer: { width: '100%', marginBottom: '10px' },
    previewButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
    playButton: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    pauseButton: { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    actionButtons: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' },
    uploadButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', flex: 1 },
    cancelButton: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', flex: 1 }
};

export default VoiceRecorder;