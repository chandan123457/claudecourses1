import React, { useState } from 'react';
import api from '../config/api';
import { formatDisplayDate } from '../utils/programAccess';

const CertificateVerificationPage = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = async (event) => {
    event.preventDefault();
    const trimmedId = certificateId.trim().toUpperCase();
    if (!trimmedId) {
      setError('Enter Certificate ID');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get('/certification/verify', {
        params: { certificateId: trimmedId },
      });
      setResult(response.data.data);
    } catch (err) {
      setResult(null);
      setError(err.response?.status === 404 ? 'Certificate not found.' : 'Unable to verify certificate right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2]">
      <section className="border-b border-[#E2DDD3] bg-[linear-gradient(180deg,#FCFBF8_0%,#F5F5F2_100%)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-[#E7D39A] bg-[#FFF8E3] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#B88905]">
              Certificate Verification
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-[#161616] sm:text-5xl">
              Verify every certificate with the official GradToPro record.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#6E6A63]">
              Enter the certificate ID shown on the generated certificate. If the certificate is issued, the learner name,
              program, and issue date will appear here.
            </p>
          </div>

          <div className="w-full max-w-[420px] rounded-[24px] border border-[#E2DDD3] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="rounded-[20px] bg-[#111827] px-5 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Trusted Validation</p>
              <p className="mt-3 text-2xl font-bold">Instant certificate lookup</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-white/50">Live Record</p>
                  <p className="mt-1 font-semibold">Issued by admin</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-white/50">Result</p>
                  <p className="mt-1 font-semibold">Found or not found</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[28px] border border-[#E1DDD4] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-8">
            <form onSubmit={handleVerify}>
              <label className="block text-sm font-bold uppercase tracking-[0.16em] text-[#6A655F]">
                Enter Certificate ID
              </label>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <input
                  type="text"
                  value={certificateId}
                  onChange={(event) => setCertificateId(event.target.value.toUpperCase())}
                  placeholder="Enter Certificate ID"
                  className="h-14 flex-1 rounded-2xl border border-[#D8D3C8] bg-[#FCFBF8] px-5 text-[16px] font-medium text-[#161616] outline-none transition-all placeholder:text-[#A19C93] focus:border-[#E0B31A] focus:ring-4 focus:ring-[#E0B31A]/10"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 rounded-2xl bg-[#F3C206] px-8 text-[16px] font-bold text-[#111111] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="mt-8 rounded-[24px] border border-[#D9E8D6] bg-[#F8FFF7] p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                      Verified
                    </span>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#1A1A1A]">
                      Certificate record found
                    </h2>
                  </div>
                  {result.certificateUrl ? (
                    <a
                      href={result.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-[#CFE0CC] bg-white px-5 text-sm font-semibold text-[#1F4D1B] hover:bg-[#F1FAF0]"
                    >
                      View Certificate
                    </a>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ResultCard label="Certificate ID" value={result.certificateId} />
                  <ResultCard label="User Name" value={result.userName} />
                  <ResultCard label="Programs" value={result.program} />
                  <ResultCard label="Issue Date" value={formatDisplayDate(result.issueDate, { month: 'long' })} />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="rounded-[28px] border border-[#E1DDD4] bg-[#111827] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">How It Works</p>
            <div className="mt-6 space-y-5">
              <InfoStep number="01" title="Get the certificate ID" text="Use the verification number generated when the certificate is issued." />
              <InfoStep number="02" title="Enter it here" text="Paste the ID exactly as shown on the certificate or admin panel." />
              <InfoStep number="03" title="Review the record" text="You will see certificate ID, user name, program, and issue date if it exists." />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

const ResultCard = ({ label, value }) => (
  <div className="rounded-2xl border border-[#DCE8D9] bg-white px-4 py-4">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7D8978]">{label}</p>
    <p className="mt-2 text-base font-bold text-[#1A1A1A]">{value || 'N/A'}</p>
  </div>
);

const InfoStep = ({ number, title, text }) => (
  <div className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-5">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#F3C206]">{number}</span>
    <p className="mt-3 text-lg font-bold">{title}</p>
    <p className="mt-2 text-sm leading-7 text-white/60">{text}</p>
  </div>
);

export default CertificateVerificationPage;
