import React from 'react';
import InfoPageLayout from '../components/InfoPageLayout';

const privacySections = [
  {
    paragraphs: [
      'At GradToPro, we respect and protect your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.'
    ]
  },
  {
    heading: 'Information We Collect',
    paragraphs: [
      'We collect personal information such as name, email, phone number, and account details when users register on the platform.'
    ]
  },
  {
    heading: 'Usage Data',
    paragraphs: [
      'We may collect data about how users interact with the platform, including course progress, activity logs, and preferences.'
    ]
  },
  {
    heading: 'How We Use Data',
    paragraphs: [
      'Your information is used to provide services, improve user experience, personalize learning, and communicate important updates.'
    ]
  },
  {
    heading: 'Data Protection',
    paragraphs: [
      'We implement appropriate security measures to protect your personal data from unauthorized access or misuse.'
    ]
  },
  {
    heading: 'Sharing of Information',
    paragraphs: [
      'We do not sell or rent your personal data. Information may be shared only with trusted partners for service delivery, such as payment processing.'
    ]
  },
  {
    heading: 'Cookies',
    paragraphs: [
      'We use cookies to enhance user experience and analyze platform performance.'
    ]
  },
  {
    heading: 'User Rights',
    paragraphs: [
      'Users have the right to access, update, or delete their personal data by contacting support.'
    ]
  },
  {
    heading: 'Third-Party Services',
    paragraphs: [
      'Our platform may use third-party tools, such as analytics or authentication services, which may collect limited user data.'
    ]
  },
  {
    heading: 'Policy Updates',
    paragraphs: [
      'This Privacy Policy may be updated periodically. Users are encouraged to review it regularly.'
    ]
  }
];

const PrivacyPolicyPage = () => {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      sections={privacySections}
    />
  );
};

export default PrivacyPolicyPage;
