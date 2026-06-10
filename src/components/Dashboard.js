import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserScreenshots, deleteScreenshot, getVoiceUrl } from '../services/api';
import ScreenshotUpload from './ScreenshotUpload';
import VoiceRecorder from './VoiceRecorder';

function Dashboard({ userId }) {
    const [screenshots, setScreenshots] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadScreenshots = useCallback(async () => {
        try {
            const response = await getUserScreenshots(userId);
            if (response.data.success) {
                setScreenshots(response.data.data);
            }
        } catch (error) {
            console.error('Error loading screenshots:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadScreenshots();
    }, [loadScreenshots]);

    const handleDelete = async (screenshotId) => {
        if (window.confirm('Delete this screenshot?')) {
            await deleteScreenshot(userId, screenshotId);
            loadScreenshots();
        }
    };

    return (
        <div style={styles.container}>
            <h1>Screenshot Voice Assistant</h1>

            <ScreenshotUpload userId={userId} onUpload={loadScreenshots} />

            <h2>My Screenshots</h2>
            {loading ? (
                <p>Loading...</p>
            ) : screenshots.length === 0 ? (
                <p>No screenshots yet. Upload one above!</p>
            ) : (
                <div style={styles.grid}>
                    {screenshots.map((screenshot) => (
                        <ScreenshotCard
                            key={screenshot.id}
                            screenshot={screenshot}
                            userId={userId}
                            onDelete={handleDelete}
                            onVoiceUpload={loadScreenshots}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Separate component to prevent re-renders
const ScreenshotCard = React.memo(({ screenshot, userId, onDelete, onVoiceUpload }) => {
    const [imageError, setImageError] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const imageUrl = `http://localhost:8080/api/screenshots/${screenshot.id}/user/${userId}/file?t=${screenshot.updatedAt || screenshot.createdAt}`;
    const voiceUrl = getVoiceUrl(userId, screenshot.id);

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(error => {
                    console.error('Playback failed:', error);
                    setAudioError(true);
                });
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const handleAudioError = () => {
        setAudioError(true);
        console.error('Audio failed to load for screenshot:', screenshot.id);
    };

    return (
        <div style={styles.card}>
            {!imageError ? (
                <img
                    src={imageUrl}
                    alt={screenshot.renamedName || screenshot.originalName}
                    style={styles.image}
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
            ) : (
                <div style={styles.imagePlaceholder}>
                    📷 No Preview
                </div>
            )}
            <div style={styles.cardContent}>
                <p><strong>{screenshot.renamedName || screenshot.originalName}</strong></p>
                <p style={styles.date}>{screenshot.createdAt ? new Date(screenshot.createdAt).toLocaleDateString() : 'Just now'}</p>

                {screenshot.hasVoice && !audioError && (
                    <div style={styles.voiceContainer}>
                        <audio
                            ref={audioRef}
                            onEnded={handleAudioEnded}
                            onError={handleAudioError}
                            style={styles.audioPlayer}
                            preload="metadata"
                        >
                            <source src={voiceUrl} type="audio/wav" />
                            <source src={voiceUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                        <div style={styles.voiceButtons}>
                            {!isPlaying ? (
                                <button onClick={handlePlay} style={styles.playButton}>
                                    ▶️ Play Voice
                                </button>
                            ) : (
                                <button onClick={handlePause} style={styles.pauseButton}>
                                    ⏸️ Pause
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {screenshot.hasVoice && audioError && (
                    <div style={styles.voiceContainer}>
                        <p style={styles.audioError}>⚠️ Voice note available but preview failed</p>
                        <a href={voiceUrl} download style={styles.downloadLink}>
                            📥 Download Voice File
                        </a>
                    </div>
                )}

                <VoiceRecorder
                    userId={userId}
                    screenshotId={screenshot.id}
                    onUpload={onVoiceUpload}
                />

                <button onClick={() => onDelete(screenshot.id)} style={styles.deleteButton}>
                    Delete Screenshot
                </button>
            </div>
        </div>
    );
});

const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: { border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', backgroundColor: 'white' },
    image: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#f0f0f0' },
    imagePlaceholder: { width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#666' },
    cardContent: { padding: '15px' },
    date: { fontSize: '12px', color: '#666', marginBottom: '10px' },
    voiceContainer: { margin: '10px 0', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' },
    audioPlayer: { width: '100%', marginBottom: '10px', display: 'block' },
    voiceButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
    playButton: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    pauseButton: { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', margin: '5px', borderRadius: '5px', cursor: 'pointer', width: '100%' },
    audioError: { color: 'orange', fontSize: '12px', textAlign: 'center', marginBottom: '8px' },
    downloadLink: { display: 'block', textAlign: 'center', fontSize: '12px', color: '#007bff', textDecoration: 'none' }
};

export default Dashboard;
