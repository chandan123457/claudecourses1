import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../config/api';
import useRazorpay from '../hooks/useRazorpay';

const TABS = [
  ['roadmap', 'ROADMAP'],
  ['requirements', 'REQUIREMENTS'],
  ['evaluation', 'EVALUATION'],
  ['perks', 'PERKS'],
  ['re-evaluation', 'RE-EVALUATION'],
];

const price = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

const CertificationProgramPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { isLoaded: razorpayLoaded } = useRazorpay();
  const [project, setProject] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('roadmap');
  const [couponCode, setCouponCode] = useState('STUDENT25');
  const [appliedCoupon, setAppliedCoupon] = useState('STUDENT25');
  const [pricing, setPricing] = useState({ basePrice: 0, discount: 0, platformFee: 0, finalPayable: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/certification/projects/${identifier}`);
        const data = response.data.data;
        setProject(data);
        const recommended = data.plans.find((item) => item.isRecommended) || data.plans[0];
        setSelectedPlanId(recommended?.id || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load certification details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [identifier]);

  const selectedPlan = useMemo(
    () => project?.plans.find((item) => item.id === selectedPlanId) || null,
    [project, selectedPlanId]
  );

  useEffect(() => {
    if (!project || !selectedPlan) return;
    setPricing({
      basePrice: selectedPlan.price,
      discount: 0,
      platformFee: project.platformFee,
      finalPayable: selectedPlan.price + project.platformFee,
    });
    if (appliedCoupon) {
      applyCoupon(appliedCoupon, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, selectedPlanId]);

  const applyCoupon = async (codeOverride, silent = false) => {
    const code = (codeOverride ?? couponCode).trim().toUpperCase();
    if (!project || !selectedPlan || !code) return;

    if (!silent) setProcessing(true);
    setError('');
    try {
      const response = await api.post('/certification/apply-coupon', {
        projectId: project.id,
        planId: selectedPlan.id,
        code,
      });
      setPricing(response.data.data.pricing);
      setAppliedCoupon(code);
      setCouponCode(code);
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.message || 'Coupon could not be applied.');
      } else {
        setAppliedCoupon('');
      }
    } finally {
      if (!silent) setProcessing(false);
    }
  };

  const handleEnroll = async () => {
    if (!project || !selectedPlan) return;
    if (project.enrollment?.id) {
      navigate(`/certification/workspace/${project.enrollment.id}`);
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const response = await api.post('/certification/create-order', {
        projectId: project.id,
        planId: selectedPlan.id,
        couponCode: appliedCoupon || undefined,
      });

      const order = response.data.data;
      if (!order.requiresPayment) {
        navigate(`/certification/workspace/${order.enrollmentId}`);
        return;
      }

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Payment service is still loading. Please try again.');
      }

      const paymentWindow = new window.Razorpay({
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'GradToPro',
        description: `${project.title} - ${selectedPlan.name}`,
        order_id: order.orderId,
        theme: { color: '#E4B61A' },
        handler: async (payment) => {
          try {
            const verified = await api.post('/certification/verify-payment', {
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            });
            navigate(`/certification/workspace/${verified.data.data.enrollmentId}`);
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });

      paymentWindow.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to start enrollment right now.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#F3F2ED]">
          <div className="h-12 w-12 rounded-full border-4 border-[#E4B61A] border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#F3F2ED] px-6">
          <div className="rounded-[20px] border border-[#FECACA] bg-white px-8 py-8 text-[#DC2626]">{error || 'Certification not found.'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const tabContent = project.sections?.[selectedTab] || [];

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-68px)] bg-[#F3F2ED]">
        <div className="mx-auto max-w-[1380px] px-6 py-10 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-10">
              <section className="rounded-[22px] border border-[#D8DDE5] bg-white px-11 py-11 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-8 md:flex-row md:justify-between">
                  <div className="max-w-[760px]">
                    <span className="inline-flex rounded-[6px] bg-[#FFF5D7] px-5 py-2 text-[14px] font-black tracking-[0.16em] text-[#D4A107]">
                      {project.bannerLabel || `${project.domain.toUpperCase()} DOMAIN`}
                    </span>
                    <h1 className="mt-6 max-w-[640px] text-[58px] font-black leading-[1.06] tracking-[-0.04em] text-[#1B233B]">
                      {project.title}
                    </h1>
                    <p className="mt-5 max-w-[780px] text-[18px] leading-[2.35rem] text-[#66748F]">
                      {project.description}
                    </p>
                  </div>

                  <div className="grid min-w-[210px] grid-cols-2 gap-6 text-right">
                    <div>
                      <p className="text-[14px] font-black tracking-[0.14em] text-[#A1AEC7]">DIFFICULTY</p>
                      <p className="mt-1 text-[18px] font-semibold leading-8 text-[#243047]">{project.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-black tracking-[0.14em] text-[#A1AEC7]">DURATION</p>
                      <p className="mt-1 text-[18px] font-semibold leading-8 text-[#243047]">
                        {project.durationWeeks + 6}-{project.durationWeeks + 10}
                        <br />
                        Weeks
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-7 text-[16px] font-black tracking-[0.18em] text-[#9AA8C0]">SELECT TENURE PLAN</p>
                <div className="grid gap-8 md:grid-cols-2">
                  {project.plans.map((plan) => {
                    const active = plan.id === selectedPlanId;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative rounded-[22px] border bg-white px-9 py-9 text-left shadow-[0_4px_20px_rgba(15,23,42,0.05)] ${
                          active ? 'border-[#E4B61A] ring-2 ring-[#E4B61A]/25' : 'border-[#D8DDE5]'
                        }`}
                      >
                        {plan.isRecommended && (
                          <span className="absolute right-8 top-[-18px] inline-flex h-[36px] items-center rounded-full bg-[#E4B61A] px-5 text-[13px] font-black tracking-[0.16em] text-white">
                            RECOMMENDED
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <h2 className="text-[28px] font-black leading-tight text-[#243047]">{plan.name}</h2>
                            <p className="mt-1 text-[16px] text-[#A0AEC0]">{plan.subtitle}</p>
                          </div>
                          <p className="text-[34px] font-black text-[#E4B61A]">{price(plan.price)}</p>
                        </div>

                        <div className="mt-8 space-y-4">
                          {plan.features.map((feature) => {
                            const muted = feature.toLowerCase().includes('live mock') && !plan.isRecommended;
                            return (
                              <div key={feature} className="flex items-start gap-4">
                                <span className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${muted ? 'bg-[#E2E8F0] text-white' : 'bg-[#22C55E] text-white'}`}>
                                  {muted ? 'x' : '•'}
                                </span>
                                <span className="text-[16px] leading-8 text-[#475569]">{feature}</span>
                              </div>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-[22px] border border-[#D8DDE5] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap border-b border-[#E6EAF1]">
                  {TABS.map(([key, label]) => {
                    const active = key === selectedTab;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTab(key)}
                        className={`px-9 py-6 text-[15px] font-black tracking-[0.1em] ${
                          active ? 'border-b-2 border-[#E4B61A] text-[#D4A107]' : 'text-[#9AA8C0]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="px-11 py-11">
                  <div className="space-y-12">
                    {tabContent.map((item, index) => (
                      <div key={`${item.title}-${index}`} className="flex gap-8">
                        <div className="relative flex w-[42px] flex-col items-center">
                          <div className={`z-10 flex h-[46px] w-[46px] items-center justify-center rounded-full text-[16px] font-black ${
                            index === 0 ? 'bg-[#F4C20D] text-white' : 'bg-[#EFF2F7] text-[#98A2B3]'
                          }`}>
                            {item.stepNumber ? String(item.stepNumber).padStart(2, '0') : '•'}
                          </div>
                          {index < tabContent.length - 1 && (
                            <div className="absolute top-[46px] h-[78px] w-[2px] bg-[#E6EAF1]" />
                          )}
                        </div>
                        <div className="pt-1">
                          <h3 className="text-[20px] font-black text-[#1E293B]">{item.title}</h3>
                          <p className="mt-2 max-w-[820px] text-[17px] leading-[2.1rem] text-[#64748B]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <aside className="sticky top-[96px] rounded-[22px] border border-[#D8DDE5] bg-white px-9 py-9 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
              <h2 className="text-[26px] font-black text-[#243047]">Enrollment Summary</h2>

              <div className="mt-10 space-y-7 text-[17px]">
                <SummaryRow label="Selected Program" value={project.title} />
                <SummaryRow label="Tenure Plan" value={selectedPlan?.name} />
                <SummaryRow label="Base Price" value={price(pricing.basePrice)} valueStrong />
              </div>

              <div className="mt-8">
                <p className="text-[14px] font-black tracking-[0.14em] text-[#9AA8C0]">PROMO CODE</p>
                <div className="mt-5 flex items-end gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="h-[52px] flex-1 rounded-[8px] bg-[#F3F3F1] px-4 text-[16px] text-[#64748B] outline-none"
                  />
                  <button
                    onClick={() => applyCoupon()}
                    disabled={processing}
                    className="h-[50px] rounded-[6px] bg-[#E4B61A] px-6 text-[16px] font-bold text-white disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="mt-5 text-[15px] text-[#22C55E]">✓ Code '{appliedCoupon}' active</p>
                )}
              </div>

              <div className="mt-6 border-t border-[#E6EAF1] pt-7">
                <SummaryRow label="Platform Fee" value={price(pricing.platformFee)} valueStrong />

                <div className="mt-5 rounded-[8px] bg-[#F3F3F1] px-6 py-6">
                  <p className="text-[14px] font-black tracking-[0.14em] text-[#9AA8C0]">TOTAL PAYABLE</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <p className="text-[46px] font-black leading-none text-[#E4B61A]">{price(pricing.finalPayable)}</p>
                    <div className="text-right">
                      {pricing.discount > 0 && (
                        <p className="text-[16px] text-[#B6C0D0] line-through">{price(pricing.basePrice + pricing.platformFee)}</p>
                      )}
                      <p className="text-[16px] font-black text-[#22C55E]">
                        SAVE ₹ {Number(pricing.discount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-[14px] border border-[#FECACA] bg-[#FFF1F2] px-4 py-3 text-[14px] text-[#DC2626]">
                  {error}
                </div>
              )}

              <button
                onClick={handleEnroll}
                disabled={processing}
                className="mt-10 h-[68px] w-full rounded-[6px] bg-[#F4C20D] text-[21px] font-black text-white disabled:opacity-60"
              >
                {project.enrollment?.id ? 'Continue Workspace' : processing ? 'Processing...' : 'Enroll & Pay Now →'}
              </button>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const SummaryRow = ({ label, value, valueStrong = false }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-[#64748B]">{label}</span>
    <span className={`max-w-[180px] text-right ${valueStrong ? 'font-semibold text-[#1E293B]' : 'font-medium text-[#243047]'}`}>
      {value}
    </span>
  </div>
);

export default CertificationProgramPage;

