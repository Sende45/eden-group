import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '900px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: April 09, 2026</p>
      <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
      <p>We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>

      <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

      <h2>Interpretation and Definitions</h2>
      <h3>Interpretation</h3>
      <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
      
      <h3>Definitions</h3>
      <p>For the purposes of this Privacy Policy:</p>
      <ul>
        <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
        <li><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party.</li>
        <li><strong>Application</strong> refers to Eden, the software program provided by the Company.</li>
        <li><strong>Company</strong> refers to EDEN GROUP, Allée des Pierres Mayettes. For the purposes of the GDPR, the Company is the Data Controller.</li>
        <li><strong>Website</strong> refers to Eden-group, accessible from <a href="https://eden-group.co/" target="_blank" rel="noopener noreferrer">https://eden-group.co/</a>.</li>
        <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
      </ul>

      <h2>Collecting and Using Your Personal Data</h2>
      <h3>Types of Data Collected</h3>
      <h4>Personal Data</h4>
      <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information:</p>
      <ul>
        <li>Email address</li>
        <li>First name and last name</li>
        <li>Phone number</li>
        <li>Address, State, Province, ZIP/Postal code, City</li>
      </ul>

      <h4>Information Collected while Using the Application</h4>
      <p>While using Our Application, We may collect, with Your prior permission:</p>
      <ul>
        <li>Information regarding your location</li>
        <li>Pictures and other information from your Device's camera and photo library</li>
      </ul>

      <h2>Detailed Information on the Processing of Your Personal Data</h2>
      <p>The Service Providers We use may have access to Your Personal Data.</p>
      
      <h3>Analytics</h3>
      <ul>
        <li>
          <strong>Firebase:</strong> Firebase is an analytics service provided by Google Inc. 
          Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
        </li>
      </ul>

      <h3>Email Marketing</h3>
      <ul>
        <li>
          <strong>EmailJS:</strong> Used to manage and send emails. 
          Policy: <a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">https://www.emailjs.com/legal/privacy-policy/</a>
        </li>
      </ul>

      <h2>GDPR Privacy</h2>
      <h3>Legal Basis for Processing Personal Data under GDPR</h3>
      <p>We may process Personal Data under conditions such as Consent, Performance of a contract, or Legal obligations.</p>

      <h2>Your Rights under the GDPR</h2>
      <p>The Company undertakes to respect the confidentiality of Your Personal Data. You have the right to:</p>
      <ul>
        <li>Request access to Your Personal Data.</li>
        <li>Request correction or erasure of Your Personal Data.</li>
        <li>Object to processing or request restriction.</li>
        <li>Withdraw Your consent.</li>
      </ul>

      <h2>Security of Your Personal Data</h2>
      <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet is 100% secure.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, You can contact us:</p>
      <ul style={{ listStyle: 'none', padding: '0' }}>
        <li><strong>📧 Email:</strong> direction@eden-group.pro</li>
        <li><strong>📞 Phone:</strong> 0780801642</li>
        <li><strong>📍 Mail:</strong> 17 Rue Boucherie Basse, 43000 Le Puy-en-Velay, France</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;