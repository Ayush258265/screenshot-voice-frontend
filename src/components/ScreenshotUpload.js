import React, { useState } from 'react';
import { uploadScreenshot } from '../services/api';

function ScreenshotUpload({ userId, onUpload }) {
    const [file, setFile] = useState(null);
    const [renameName, setRenameName] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a screenshot');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('screenshot', file);
        if (renameName) {
            formData.append('renamedName', renameName);
        }

        try {
            await uploadScreenshot(userId, formData);
            alert('Upload successful!');
            setFile(null);
            setRenameName('');
            onUpload();
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3>Upload Screenshot</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
                <input type="text" placeholder="Name (optional)" value={renameName} onChange={(e) => setRenameName(e.target.value)} style={styles.input} />
                <button type="submit" disabled={uploading} style={styles.button}>
                    {uploading ? 'Uploading...' : 'Upload Screenshot'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { border: '1px solid #ccc', borderRadius: '10px', padding: '20px', marginBottom: '20px' },
    form: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
    fileInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px' },
    input: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 },
    button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default ScreenshotUpload;