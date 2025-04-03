import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';

const Legal = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Pumpee Legal</h1>
            <Link to="/">
              <Button variant="outline" size="sm">Back to Home</Button>
            </Link>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b border-border">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'terms'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('terms')}
              >
                Terms of Service
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'privacy'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                Privacy Policy
              </button>
            </div>
          </div>
          
          <div className="prose prose-sm sm:prose max-w-none text-foreground">
            {activeTab === 'terms' ? (
              <>
                <h2>Terms of Service</h2>
                <h3>1. Introduction</h3>
                <p>
                  Welcome to Pumpee ("we," "our," or "us"). By accessing or using our application, website, and 
                  services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). 
                  Please read these Terms carefully.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and Pumpee regarding your use of our 
                  fitness tracking and planning application.
                </p>
                
                <h3>2. Eligibility</h3>
                <p>
                  To use our Services, you must be at least 16 years old. If you are between 16 and 18 years old, 
                  you confirm that you have permission from your parent or guardian to use our Services. By using our 
                  Services, you represent and warrant that you meet these eligibility requirements.
                </p>
                
                <h3>3. Account Registration</h3>
                <p>
                  To access certain features of our Services, you may need to register for an account. You agree to 
                  provide accurate, current, and complete information during the registration process and to update 
                  such information to keep it accurate, current, and complete.
                </p>
                <p>
                  You are responsible for safeguarding your password and for all activities that occur under your account. 
                  You agree to notify us immediately of any unauthorized use of your account.
                </p>
                
                <h3>4. User Content</h3>
                <p>
                  Our Services may allow you to upload, submit, store, send, or receive content such as fitness data, 
                  workout routines, photos, and comments ("User Content"). You retain ownership rights in your User Content.
                </p>
                <p>
                  By submitting User Content, you grant Pumpee a worldwide, non-exclusive, royalty-free license to use, 
                  copy, modify, create derivative works based on, distribute, publicly display, and publicly perform your 
                  User Content for the purposes of operating and providing our Services.
                </p>
                
                <h3>5. More Information</h3>
                <p>
                  For the complete Terms of Service, please request a full copy by emailing support@pumpee.com.
                </p>
              </>
            ) : (
              <>
                <h2>Privacy Policy</h2>
                <h3>1. Introduction</h3>
                <p>
                  This Privacy Policy explains how Pumpee ("we," "our," or "us") collects, uses, and shares information 
                  about you when you use our application, website, and services (collectively, the "Services").
                </p>
                <p>
                  This Privacy Policy applies to all users of our Services, with particular provisions to ensure compliance 
                  with the General Data Protection Regulation (GDPR) for users in the European Union.
                </p>
                
                <h3>2. Personal Data We Collect</h3>
                <p>We may collect the following categories of personal data:</p>
                <h4>2.1 Information You Provide to Us</h4>
                <ul>
                  <li><strong>Account Information</strong>: When you register for an account, we collect your name, email address, and password.</li>
                  <li><strong>Profile Information</strong>: Information you add to your profile, such as profile picture, height, weight, age, gender, and fitness goals.</li>
                  <li><strong>Health and Fitness Data</strong>: Information about your workouts, physical activities, and other health-related metrics.</li>
                  <li><strong>Communications</strong>: When you contact us, we collect information you provide in your communications.</li>
                </ul>
                
                <h3>3. Your Rights</h3>
                <p>Under the GDPR, you have the following rights:</p>
                <ul>
                  <li>Right to Access</li>
                  <li>Right to Rectification</li>
                  <li>Right to Erasure</li>
                  <li>Right to Restrict Processing</li>
                  <li>Right to Object to Processing</li>
                  <li>Right to Data Portability</li>
                </ul>
                
                <h3>4. More Information</h3>
                <p>
                  For the complete Privacy Policy, please request a full copy by emailing privacy@pumpee.com.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;