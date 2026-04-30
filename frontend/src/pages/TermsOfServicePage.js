import React from 'react';
import InfoPageLayout from '../components/InfoPageLayout';

const termsSections = [
  {
    paragraphs: [
      'By accessing or using GradToPro, you agree to comply with and be bound by the following Terms of Service.'
    ]
  },
  {
    heading: 'Use of Platform',
    paragraphs: [
      'Users must use the platform only for lawful purposes. Any misuse, unauthorized access, or attempt to disrupt the platform’s functionality is strictly prohibited.'
    ]
  },
  {
    heading: 'Account Responsibility',
    paragraphs: [
      'Users are responsible for maintaining the confidentiality of their account credentials. Any activity performed under your account is your responsibility.'
    ]
  },
  {
    heading: 'Course Access',
    paragraphs: [
      'Access to courses, certifications, and resources is granted for personal and non-commercial use only. Redistribution or resale of content is not allowed.'
    ]
  },
  {
    heading: 'Intellectual Property',
    paragraphs: [
      'All content, including videos, materials, designs, and branding, belongs to GradToPro. Unauthorized use, copying, or distribution is prohibited.'
    ]
  },
  {
    heading: 'Certification',
    paragraphs: [
      'Certificates issued are based on completion criteria defined by the platform. Any misuse or falsification of certificates may lead to account suspension.'
    ]
  },
  {
    heading: 'Payments and Refunds',
    paragraphs: [
      'Payments made for courses or services are subject to the platform’s refund policy. Refund eligibility may vary depending on course type and usage.'
    ]
  },
  {
    heading: 'Limitation of Liability',
    paragraphs: [
      'GradToPro is not liable for any direct or indirect damages arising from the use of the platform.'
    ]
  },
  {
    heading: 'Termination',
    paragraphs: [
      'We reserve the right to suspend or terminate accounts that violate our policies without prior notice.'
    ]
  },
  {
    heading: 'Changes to Terms',
    paragraphs: [
      'GradToPro may update these terms at any time. Continued use of the platform implies acceptance of the updated terms.'
    ]
  }
];

const TermsOfServicePage = () => {
  return (
    <InfoPageLayout
      title="Terms of Service"
      sections={termsSections}
    />
  );
};

export default TermsOfServicePage;
