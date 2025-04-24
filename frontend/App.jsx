import React, { useState } from 'react';
import './index.css';
// trigger redeploy
function App() {
  const [ppt, setPpt] = useState(null);
  const [excel, setExcel] = useState(null);
  const [vba, setVba] = useState(null);
  const [manualData, setManualData] = useState({ row9: '', row10: '', row11: '', row12: '' });
  const [campaignType, setCampaignType] = useState('');
  const [groupType, setGroupType] = useState('');
  const [ioInputs, setIoInputs] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle');
  const [fileUrl, setFileUrl] = useState(null);
  const [colorStatus, setColorStatus] = useState('');
// temp update to trigger git
  const glowColor =
    status === 'success' ? 'glow-green' :
    status === 'fail' ? 'glow-red' : '';

  const handleFileChange = (setter) => (e) => setter(e.target.files[0]);

  const handleManualChange = (e) => {
    setManualData({ ...manualData, [e.target.name]: e.target.value });
  };

  const handleIOChange = (index) => (e) => {
    const updated = [...ioInputs];
    updated[index] = e.target.value;
    setIoInputs(updated);
  };

  const handleSubmit = async () => {
    setStatus('loading');
    const formData = new FormData();
    if (ppt) formData.append('ppt', ppt);
    if (excel) formData.append('excel', excel);
    if (vba) formData.append('vba', vba);

    Object.entries(manualData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('campaignType', campaignType);
    formData.append('groupType', groupType);
    ioInputs.forEach((val, idx) => {
      if (val) formData.append(`ioInput${idx + 1}`, val);
    });

    try {
      const res = await fetch('https://project-senior-backend.onrender.com/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to process');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setColorStatus(res.headers.get('X-Color-Status'));
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('fail');
    }
  };

  return (
    <div className={`app-container dark-mode ${glowColor}`}>
      <h1>Project Senior</h1>

      <div className="upload-grid">
        <label>PPT File</label>
        <input type="file" accept=".pptx" onChange={handleFileChange(setPpt)} />

        <label>Excel File</label>
        <input type="file" accept=".xlsx,.xlsm" onChange={handleFileChange(setExcel)} />

        <label>VBA Extract (.txt)</label>
        <input type="file" accept=".txt" onChange={handleFileChange(setVba)} />

        <label>Manual Data Entry (Rows 9–12)</label>
        <input name="row9" placeholder="0-3 Month Count" onChange={handleManualChange} />
        <input name="row10" placeholder="0-3 Month %" onChange={handleManualChange} />
        <input name="row11" placeholder="No Prior Count" onChange={handleManualChange} />
        <input name="row12" placeholder="No Prior %" onChange={handleManualChange} />

        <label>Campaign Type</label>
        <div>
          <label><input type="radio" name="campaignType" value="SB" onChange={(e) => setCampaignType(e.target.value)} /> SB</label>
          <label style={{ marginLeft: '1rem' }}><input type="radio" name="campaignType" value="MBC" onChange={(e) => setCampaignType(e.target.value)} /> MBC</label>
        </div>

        <label>Group Level</label>
        <div>
          <label><input type="radio" name="groupType" value="Pacing" onChange={(e) => setGroupType(e.target.value)} /> Pacing Group Level</label>
          <label style={{ marginLeft: '1rem' }}><input type="radio" name="groupType" value="IO" onChange={(e) => setGroupType(e.target.value)} /> IO Group Level</label>
        </div>

        {groupType === 'IO' && (
          <div style={{ marginTop: '1rem' }}>
            <label>IO Group Level Inputs</label>
            {ioInputs.map((val, idx) => (
              <input key={idx} type="text" placeholder={`IO Input ${idx + 1}`} value={val} onChange={handleIOChange(idx)} />
            ))}
          </div>
        )}
      </div>

      <button className="submit-button" onClick={handleSubmit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Processing…' : 'Submit'}
      </button>

      {status === 'success' && (
        <>
          {colorStatus && <p style={{ marginTop: '1rem' }}>📊 <strong>{colorStatus}</strong></p>}
          {fileUrl && (
            <a className="download-link" href={fileUrl} download="Updated_Report.xlsm">
              Download Excel File
            </a>
          )}
        </>
      )}

      {status === 'fail' && <p className="error-msg">❌ Processing failed. Please check your input files.</p>}
    </div>
  );
}

export default App;
