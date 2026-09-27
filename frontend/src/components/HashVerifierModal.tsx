import React, { useEffect, useState } from 'react';
import { AuditLogEntry } from '../types';
import {
  LockIcon,
  XIcon,
  LayersIcon,
  CpuIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  AlertOctagonIcon,
  FileTextIcon
} from './Icons';

interface HashVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLog: AuditLogEntry | null;
  parentLog?: AuditLogEntry | null;
}

export const HashVerifierModal: React.FC<HashVerifierModalProps> = ({
  isOpen,
  onClose,
  selectedLog,
  parentLog
}) => {
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const [canonicalPayload, setCanonicalPayload] = useState<string>('');
  const [editablePayload, setEditablePayload] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const formatTimestamp = (ts: string): string => {
    if (!ts) return '';
    if (ts.includes('Z') || ts.includes('+')) {
      try {
        const d = new Date(ts);
        return d.toISOString().replace('Z', '');
      } catch {
        return ts;
      }
    }
    return ts;
  };

  const computeSha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const performVerification = async (payloadToHash: string) => {
    setIsVerifying(true);
    try {
      const hash = await computeSha256(payloadToHash);
      setCalculatedHash(hash);
    } catch (err) {
      console.error('Web Crypto SHA-256 calculation error:', err);
      setCalculatedHash('CALCULATION_ERROR');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (selectedLog) {
      const formattedTs = formatTimestamp(selectedLog.timestamp);
      const payloadStr = `${selectedLog.id}|${formattedTs}|${selectedLog.actor_type}|${selectedLog.actor_id}|${selectedLog.action_type}|${selectedLog.details_json}|${selectedLog.previous_hash}`;
      setCanonicalPayload(payloadStr);
      setEditablePayload(payloadStr);
      performVerification(payloadStr);
    }
  }, [selectedLog]);

  if (!isOpen || !selectedLog) return null;

  const isGenesis =
    !selectedLog.previous_hash ||
    selectedLog.previous_hash === '0'.repeat(64) ||
    selectedLog.previous_hash.replace(/0/g, '') === '';

  const isMatch = calculatedHash.toLowerCase() === selectedLog.current_hash.toLowerCase();

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          padding: 0
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--accent-primary)' }}><LockIcon size={18} /></span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-bright)', fontWeight: 600 }}>
                SHA-256 Decision Hash Inspector
              </h3>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Client-side Web Crypto API Verification Engine • Block {selectedLog.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ height: '30px', padding: '0 0.5rem', color: 'var(--text-muted)' }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Section 1: Parent Block Reference */}
          <div style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LayersIcon size={13} color="var(--accent-primary)" /> PARENT BLOCK (H<sub>n-1</sub>)
            </div>
            {isGenesis ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge" style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-primary)', borderColor: 'var(--border-strong)' }}>
                  GENESIS BLOCK (ROOT ANCHOR)
                </span>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  0000000000000000000000000000000000000000000000000000000000000000
                </span>
              </div>
            ) : (
              <div>
                <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {selectedLog.previous_hash}
                </div>
                {parentLog && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Linked to Block: <span className="mono" style={{ color: 'var(--accent-primary)' }}>{parentLog.id}</span> ({parentLog.action_type})
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Current Block Invariant */}
          <div style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CpuIcon size={13} color="var(--accent-primary)" /> CURRENT BLOCK (H<sub>n</sub>)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Block ID:</span>
                <div className="mono" style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{selectedLog.id}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Action:</span>
                <div className="mono" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{selectedLog.action_type}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Actor:</span>
                <div className="mono" style={{ color: 'var(--status-warning)', fontWeight: 600 }}>{selectedLog.actor_type}:{selectedLog.actor_id}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                <div className="mono" style={{ color: 'var(--text-main)' }}>{new Date(selectedLog.timestamp).toISOString()}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Stored Canonical Hash:</div>
            <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--status-normal)', wordBreak: 'break-all', backgroundColor: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              {selectedLog.current_hash}
            </div>
          </div>

          {/* Section 3: Interactive Canonical Payload Verifier */}
          <div style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileTextIcon size={13} /> VERIFICATION FORMULA & CANONICAL PAYLOAD
              </div>
              <button
                className="btn btn-outline"
                style={{ height: '26px', fontSize: '0.7rem', padding: '0 0.5rem' }}
                onClick={() => {
                  setEditablePayload(canonicalPayload);
                  performVerification(canonicalPayload);
                }}
              >
                Reset Canonical
              </button>
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Formula: SHA256(id|timestamp|actor_type|actor_id|action_type|details_json|previous_hash)
            </div>

            <textarea
              rows={3}
              value={editablePayload}
              onChange={(e) => {
                setEditablePayload(e.target.value);
                performVerification(e.target.value);
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-bright)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                padding: '0.5rem',
                outline: 'none',
                resize: 'vertical'
              }}
              title="Edit string to test cryptographic tamper detection"
            />
            {editablePayload !== canonicalPayload && (
              <div style={{ fontSize: '0.72rem', color: 'var(--status-warning)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangleIcon size={12} /> Payload modified (Simulating data tampering)
              </div>
            )}
          </div>

          {/* Section 4: Live Verification Result Banner */}
          <div
            style={{
              padding: '0.85rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${isMatch ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              backgroundColor: isMatch ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: isMatch ? 'var(--status-normal)' : 'var(--status-critical)' }}>
                {isMatch ? <CheckCircleIcon size={22} /> : <AlertOctagonIcon size={22} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isMatch ? 'var(--status-normal)' : 'var(--status-critical)' }}>
                  {isMatch ? 'HASH INTEGRITY MATCH' : 'HASH MISMATCH (INTEGRITY COMPROMISED)'}
                </div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-main)', marginTop: '0.15rem', wordBreak: 'break-all' }}>
                  Calculated: {isVerifying ? 'Calculating...' : calculatedHash}
                </div>
              </div>
            </div>
            <span
              className={`badge badge-${isMatch ? 'normal' : 'critical'}`}
              style={{ fontSize: '0.68rem' }}
            >
              {isMatch ? 'VALID BLOCK' : 'TAMPERED'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ height: '32px', fontSize: '0.78rem' }}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
