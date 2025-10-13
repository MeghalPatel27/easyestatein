import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface OtpEmailProps {
  otp: string;
  firstName: string;
}

export const OtpEmail = ({ otp, firstName }: OtpEmailProps) => (
  <Html>
    <Head />
    <Preview>Your EasyEstate verification code: {otp}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to EasyEstate!</Heading>
        <Text style={text}>Hi {firstName},</Text>
        <Text style={text}>
          Thank you for signing up! To complete your registration, please use the following verification code:
        </Text>
        <Section style={codeContainer}>
          <Text style={code}>{otp}</Text>
        </Section>
        <Text style={text}>
          This code will expire in 10 minutes. Please do not share this code with anyone.
        </Text>
        <Text style={text}>
          If you didn't request this code, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          The EasyEstate Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OtpEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const codeContainer = {
  background: '#f4f4f4',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
  textAlign: 'center' as const,
};

const code = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'monospace',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  lineHeight: '40px',
  margin: '0',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '32px',
};
