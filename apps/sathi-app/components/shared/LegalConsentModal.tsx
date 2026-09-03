import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const scale = (size: number) => Math.round((width / 390) * size);

interface LegalConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  requireConsent?: boolean;
}

export const LegalConsentModal: React.FC<LegalConsentModalProps> = ({
  visible,
  onClose,
  onAccept,
  requireConsent = false,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleAction = () => {
    if (requireConsent) {
      if (isChecked) {
        onAccept();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
          {!requireConsent && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.mainTitle}>MaiHoonNa Legal Documents</Text>

          {/* ── Terms and Conditions ── */}
          <Text style={styles.sectionTitle}>Part A — Terms and Conditions for Subscribers</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>TERMS AND CONDITIONS FOR SUBSCRIBERS</Text>{'\n'}
            These terms govern the subscription purchased by an adult ("Subscriber") on behalf of a senior-citizen Beneficiary. By tapping "I Agree" on the MaiHoonNa app, you accept these terms.
          </Text>

          <Text style={styles.subTitle}>1. Definitions</Text>
          <Text style={styles.paragraph}>In these Subscriber Terms, the following terms shall have the meanings set out below:</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"App"</Text> — The MaiHoonNa mobile application available on Android and iOS platforms, operated by MaiHoonNa Eldercare Private Limited.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Beneficiary"</Text> — The senior citizen (aged 60 years or above) for whom the Subscriber has purchased a Subscription and in whose home care services are to be delivered.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Care Mitra / Mitra"</Text> — A background-verified, trained care companion or clinical professional deployed by MaiHoonNa to deliver in-home care services to the Beneficiary.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Effective Date"</Text> — The date on which the Subscriber completes payment and the App confirms activation of the Subscription.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Family Connect"</Text> — The real-time dashboard within the App providing the Subscriber with visit logs, vitals updates, hour-balance, and encounter notes relating to the Beneficiary.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Family Member / Next of Kin (NOK)"</Text> — A person designated by the Subscriber, aged 18 years or above and of sound mind, who is authorised to make decisions on behalf of the Beneficiary in matters relating to care, in the event the Beneficiary is unable to do so.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Home Zone"</Text> — The geographical area within a 10-kilometre radius of the Beneficiary's registered residential address, within which MaiHoonNa services are operational.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Hours"</Text> — Prepaid care hours purchased by the Subscriber as part of a Subscription Package, debited in real time upon each Mitra visit or activity.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"MaiHoonNa / Company / We / Us"</Text> — MaiHoonNa Eldercare Private Limited, CIN: [CIN], having its registered office at PPC193, DLF Park Place, DLF Phase V, Galleria DLF-IV, Gurgaon – 122009, Haryana.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Partner Network"</Text> — Third-party healthcare service providers (physiotherapists, home diagnostics labs, pharmacies, physicians, and specialist practitioners) empanelled by MaiHoonNa.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Saathi Credits"</Text> — Loyalty credits earned by volunteers in the Saathi Network for companion time donated, redeemable in accordance with Clause 13.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Saathi Network"</Text> — MaiHoonNa's community of trained volunteers who provide companionship and non-clinical support to Beneficiaries under supervision of a Care Mitra.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Subscriber"</Text> — The individual (typically an adult child, relative, or corporate employer) who purchases a Subscription on behalf of a Beneficiary.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"Subscription / Subscription Package"</Text> — A prepaid bundle of care hours purchased by the Subscriber from MaiHoonNa, including Saathi Starter (10 hrs), Saathi Plus (25 hrs), Saathi Premium (50 hrs), or any bespoke corporate or palliative plan, as described in the App at the time of purchase.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>"T&C"</Text> — These Terms and Conditions for Subscribers, as amended from time to time.</Text>

          <Text style={styles.subTitle}>2. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>2.1 By tapping "I Agree", creating an account, or making a payment on the App, the Subscriber unconditionally accepts these T&C and confirms they have read, understood, and agree to be bound by them.</Text>
          <Text style={styles.paragraph}>2.2 If the Subscriber is purchasing a Subscription on behalf of a corporate entity, the Subscriber represents and warrants that they have authority to bind that entity to these T&C, and "Subscriber" shall be construed to include that entity.</Text>
          <Text style={styles.paragraph}>2.3 These T&C shall be read together with MaiHoonNa's Privacy Policy, the Beneficiary Terms and Conditions (Part B of this document), and any Subscription confirmation issued by MaiHoonNa.</Text>
          <Text style={styles.paragraph}>2.4 If the Beneficiary is unable to review or agree to Part B due to medical or cognitive limitations, the Subscriber shall execute Part B on the Beneficiary's behalf as their authorised representative, and shall be responsible for ensuring the Beneficiary is informed to the extent practicable.</Text>

          <Text style={styles.subTitle}>3. Eligibility</Text>
          <Text style={styles.paragraph}>3.1 The Subscriber must be at least 18 years of age and legally competent to contract under the Indian Contract Act, 1872.</Text>
          <Text style={styles.paragraph}>3.2 The Beneficiary must be aged 60 years or above, residing at a residential address within the Home Zone, and not suffering from any communicable disease that has not been disclosed to MaiHoonNa at the time of registration.</Text>
          <Text style={styles.paragraph}>3.3 MaiHoonNa reserves the right to decline a Subscription or terminate an existing Subscription if, in its reasonable judgment, the Beneficiary's medical condition is beyond the scope of services currently offered by MaiHoonNa, or if providing services would pose a risk to the safety of the Care Mitra or Saathi volunteer.</Text>

          <Text style={styles.subTitle}>4. Subscription Activation and Service Commencement</Text>
          <Text style={styles.paragraph}>4.1 The Subscription is activated upon successful payment and receipt of a written confirmation from MaiHoonNa via the App or registered email.</Text>
          <Text style={styles.paragraph}>4.2 Within 48 hours of activation, a MaiHoonNa Field Manager will contact the Subscriber to confirm the Beneficiary's profile, health conditions, care preferences, and schedule requirements.</Text>
          <Text style={styles.paragraph}>4.3 Service delivery (the first Mitra visit) shall commence within 72 hours of activation, or on a date mutually agreed between the Subscriber and MaiHoonNa.</Text>
          <Text style={styles.paragraph}>4.4 Services are available within the Home Zone only. If the Subscriber wishes services to be delivered at a different location ("Destination Zone"), written notice must be given at least 48 hours in advance. Availability in the Destination Zone is subject to confirmation by MaiHoonNa and cannot be guaranteed.</Text>

          <Text style={styles.subTitle}>5. Subscription Packages and Pricing</Text>
          <Text style={styles.paragraph}>5.1 MaiHoonNa offers prepaid hour-based Subscription Packages. The current packages and pricing are displayed in the App at the time of purchase and may be updated from time to time with prior notice.</Text>
          <Text style={styles.paragraph}>5.2 Hours are debited from the Subscriber's balance in real time upon each verified Mitra check-in at the Beneficiary's address. Hours consumed by Saathi volunteers are debited at the volunteer hour-equivalent rate displayed in the App.</Text>
          <Text style={styles.paragraph}>5.3 Unused Hours roll over for a period of 30 days from the end of the Subscription month. Hours not used within the roll-over period shall lapse and are not refundable.</Text>
          <Text style={styles.paragraph}>5.4 Top-up hours may be purchased at any time at the rate displayed in the App. Top-up hours are valid for 60 days from purchase.</Text>
          <Text style={styles.paragraph}>5.5 MaiHoonNa reserves the right to revise Subscription Package pricing on 30 days' written notice to the Subscriber. The revised pricing shall apply upon the next renewal.</Text>
          <Text style={styles.paragraph}>5.6 Corporate Subscribers: Enterprise Subscription pricing, volume discounts, and billing arrangements shall be governed by the Enterprise Agreement executed between MaiHoonNa and the corporate entity. In the event of any conflict between the Enterprise Agreement and these T&C, the Enterprise Agreement shall prevail.</Text>

          <Text style={styles.subTitle}>6. Payment Terms</Text>
          <Text style={styles.paragraph}>6.1 All Subscription Packages require advance payment in full before activation. MaiHoonNa does not offer credit facilities.</Text>
          <Text style={styles.paragraph}>6.2 Accepted payment methods include UPI, debit card, credit card, net banking, and such other methods as MaiHoonNa may make available from time to time on the App.</Text>
          <Text style={styles.paragraph}>6.3 Applicable GST and other statutory levies shall be charged in addition to the Subscription Package price and shall be borne by the Subscriber.</Text>
          <Text style={styles.paragraph}>6.4 In the event that any reimbursable expenses are incurred by a Care Mitra during the delivery of services (for example, travel costs for a Destination Zone visit or purchase of medical consumables at the Subscriber's request), the Subscriber shall reimburse MaiHoonNa within 7 days of receipt of the relevant invoice.</Text>
          <Text style={styles.paragraph}>6.5 MaiHoonNa shall issue GST-compliant tax invoices for all payments received from Subscribers.</Text>

          <Text style={styles.subTitle}>7. Renewal, Cancellation, and Refund Policy</Text>
          <Text style={styles.paragraph}>7.1 Subscriptions do not auto-renew. The Subscriber must actively renew before the expiry of the current Subscription period via the App.</Text>
          <Text style={styles.paragraph}>7.2 The Subscriber may cancel the Subscription at any time by submitting a written cancellation request via the App or to care@maihoonna.com.</Text>
          <Text style={styles.paragraph}>7.3 Refunds shall be calculated as follows:</Text>
          <Text style={styles.listItem}>• Cancellation within 7 days of activation and before the first Mitra visit: full refund, less payment gateway charges.</Text>
          <Text style={styles.listItem}>• Cancellation after first Mitra visit but before 50% of Hours consumed: refund of the value of unused Hours at the per-hour rate of the package, less 10% administrative charge.</Text>
          <Text style={styles.listItem}>• Cancellation after 50% or more of Hours consumed: no refund.</Text>
          <Text style={styles.listItem}>• Saathi Starter package (10 hrs): no refund once any Hours are consumed.</Text>
          <Text style={styles.paragraph}>7.4 Refunds, where applicable, shall be processed to the original payment instrument within 7–10 business days of the cancellation confirmation.</Text>
          <Text style={styles.paragraph}>7.5 MaiHoonNa reserves the right to terminate the Subscription with 7 days' written notice in the event of a material breach of these T&C by the Subscriber, NOK, or any person at the Beneficiary's residence.</Text>
          <Text style={styles.paragraph}>7.6 MaiHoonNa may terminate the Subscription immediately, without notice, if: (a) the Beneficiary is found to be suffering from an undisclosed communicable disease; (b) any member of the Subscriber's household physically threatens or harms a Care Mitra; or (c) the Subscriber engages in fraudulent or illegal activity in connection with the Subscription.</Text>

          <Text style={styles.subTitle}>8. Subscriber Obligations</Text>
          <Text style={styles.paragraph}>8.1 The Subscriber shall provide MaiHoonNa with complete, accurate, and up-to-date information about the Beneficiary's health conditions, medications, allergies, mobility limitations, and any known communicable diseases, prior to the first visit and whenever any material change occurs.</Text>
          <Text style={styles.paragraph}>8.2 The Subscriber shall ensure that the Care Mitra has safe, unobstructed access to the Beneficiary's residential address at all scheduled visit times.</Text>
          <Text style={styles.paragraph}>8.3 The Subscriber, NOK, and all residents or visitors at the Beneficiary's home shall treat all Care Mitras and Saathi volunteers with dignity and respect. Physical assault, verbal abuse, threats, or harassment of any MaiHoonNa personnel is a ground for immediate termination of the Subscription without refund.</Text>
          <Text style={styles.paragraph}>8.4 The Subscriber shall not, directly or indirectly, solicit, recruit, or privately engage any Care Mitra, Saathi volunteer, or Partner Network provider introduced by MaiHoonNa during the Subscription period and for 12 months thereafter.</Text>
          <Text style={styles.paragraph}>8.5 The Subscriber acknowledges that Care Mitras are not authorised to administer injectable medications, perform invasive clinical procedures, or provide medical diagnosis. The Subscriber shall not instruct or pressure Care Mitras to perform acts outside their qualified scope of practice.</Text>
          <Text style={styles.paragraph}>8.6 For Beneficiaries with live-in Care Mitras (applicable to certain S6 palliative packages), the Subscriber shall ensure that the Mitra is provided with adequate food, clean drinking water, a safe sleeping area, and access to a functional washroom at the Beneficiary's residence.</Text>
          <Text style={styles.paragraph}>8.7 The Subscriber shall ensure that the Beneficiary's residential premises are safe for the Care Mitra. MaiHoonNa recommends installing a smart lock or lockbox at the main entrance to facilitate safe emergency access.</Text>

          <Text style={styles.subTitle}>9. Mitra Assignment, Substitution, and Scheduling</Text>
          <Text style={styles.paragraph}>9.1 MaiHoonNa shall assign a primary Care Mitra to the Beneficiary based on the care segment (S1–S6), location, and availability. The Subscriber may request a Mitra with specific qualifications (e.g. GNM-trained, dementia-certified), subject to availability.</Text>
          <Text style={styles.paragraph}>9.2 MaiHoonNa reserves the right to substitute a Care Mitra at any time, including due to leave, illness, resignation, or performance concerns. MaiHoonNa shall endeavour to maintain care continuity and will notify the Subscriber of any substitution with as much advance notice as possible.</Text>
          <Text style={styles.paragraph}>9.3 Schedule changes requested by the Subscriber must be submitted to the App or to the designated Field Manager at least 24 hours in advance. Emergency schedule changes shall be accommodated subject to Mitra availability.</Text>
          <Text style={styles.paragraph}>9.4 MaiHoonNa maintains a 20% bench strength of standby Mitras to cover last-minute absences. In the event a replacement cannot be arranged within 2 hours of a missed visit, the Subscriber will be notified and the relevant Hours will not be debited.</Text>

          <Text style={styles.subTitle}>10. Family Connect — App Features and Limitations</Text>
          <Text style={styles.paragraph}>10.1 The Family Connect dashboard provides the Subscriber with real-time access to: visit logs and geo-verified check-in/check-out timestamps; vitals readings captured by the Care Mitra; medication adherence records; Care Mitra encounter notes; and Hour balance.</Text>
          <Text style={styles.paragraph}>10.2 Vitals data and encounter notes displayed on the Family Connect dashboard are captured by Care Mitras during visits and are for informational purposes only. They do not constitute a medical diagnosis and should not be used as a substitute for professional medical advice.</Text>
          <Text style={styles.paragraph}>10.3 MaiHoonNa does not guarantee the App's continuous availability and shall not be liable for any interruption in App services due to scheduled maintenance, technical failures, or force majeure events.</Text>
          <Text style={styles.paragraph}>10.4 The Subscriber shall not share their App login credentials with any unauthorised person. MaiHoonNa shall not be responsible for any breach of Beneficiary data resulting from the Subscriber's failure to maintain the confidentiality of their credentials.</Text>

          <Text style={styles.subTitle}>11. Healthcare Services and Medical Disclaimer</Text>
          <Text style={styles.paragraph}>11.1 MaiHoonNa is a care coordination and companionship platform, not a hospital, clinic, or registered medical institution. Services provided by Care Mitras are care support services and do not constitute the practice of medicine.</Text>
          <Text style={styles.paragraph}>11.2 Where clinical services are required (e.g. physiotherapy, diagnostics, physician consultation), MaiHoonNa will coordinate with empanelled Partner Network providers. The contract for such clinical services is between the Subscriber/Beneficiary and the Partner Network provider. MaiHoonNa earns a coordination commission from Partner Network providers and shall disclose this where required by law.</Text>
          <Text style={styles.paragraph}>11.3 The Subscriber acknowledges that the practice of elder care is not an exact science and that no guarantee of health outcomes has been made by MaiHoonNa in connection with any service.</Text>
          <Text style={styles.paragraph}>11.4 MaiHoonNa shall maintain a digital record of the Beneficiary's vitals history and clinical encounter notes. These records are the property of MaiHoonNa and shall be shared with the Subscriber upon request. The Subscriber consents to MaiHoonNa sharing these records with Partner Network providers for the purpose of care coordination. Such records are processed in accordance with the MaiHoonNa Privacy Policy.</Text>
          <Text style={styles.paragraph}>11.5 All calls made from MaiHoonNa's operations team to the Subscriber or Beneficiary may be recorded for quality assurance and safety purposes.</Text>

          <Text style={styles.subTitle}>12. Emergency Response Protocol</Text>
          <Text style={styles.paragraph}>12.1 In the event of a medical emergency involving the Beneficiary, the Care Mitra shall: (a) immediately call the NOK or Subscriber; (b) call the Emergency Response Coordinator at MaiHoonNa; and (c) if instructed or if the situation demands, call 112 or arrange ambulance transport via MaiHoonNa's partner network.</Text>
          <Text style={styles.paragraph}>12.2 The Subscriber shall ensure that the App always carries the current contact details of the designated NOK and at least one secondary emergency contact.</Text>
          <Text style={styles.paragraph}>12.3 Emergency coordination by MaiHoonNa is a best-efforts service and is subject to the availability of telecom infrastructure, ambulance partners, and hospital capacity. MaiHoonNa shall not be liable for any delay in emergency response caused by factors outside its control.</Text>
          <Text style={styles.paragraph}>12.4 MaiHoonNa reserves the right to take such emergency steps as it deems reasonably necessary for the safety of the Beneficiary, including facilitating hospital admission, without prior authorisation from the Subscriber if the Subscriber is unreachable. The Subscriber and NOK agree to cooperate fully with MaiHoonNa in such situations.</Text>

          <Text style={styles.subTitle}>13. Saathi Network and Saathi Credits</Text>
          <Text style={styles.paragraph}>13.1 The Saathi Network comprises trained volunteers who provide companionship and non-clinical support to Beneficiaries. Saathi volunteers operate under the supervision of a designated Care Mitra and are not permitted to perform clinical tasks.</Text>
          <Text style={styles.paragraph}>13.2 Subscribers in the Saathi Starter and Saathi Plus packages may be matched with Saathi volunteers for companionship visits. Saathi volunteer hours are debited at the volunteer-equivalent rate specified in the App.</Text>
          <Text style={styles.paragraph}>13.3 Saathi Credits are earned by individuals who volunteer their time in the Saathi Network. Credits are accrued at the rate of 1 credit per volunteer hour and are held in a digital wallet in the App.</Text>
          <Text style={styles.paragraph}>13.4 Saathi Credits are: (a) non-transferable; (b) not redeemable for cash; (c) redeemable solely for MaiHoonNa care services at a redemption rate published in the App from time to time; (d) subject to a maximum redemption of 20% of any single Subscription purchase; and (e) liable to expire 5 years from the date of accrual if not redeemed.</Text>
          <Text style={styles.paragraph}>13.5 MaiHoonNa reserves the right to amend the Saathi Credits programme, including the redemption rate, with 60 days' notice. Credits accrued prior to an amendment shall be honoured at the rate applicable at the time of accrual, subject to the 5-year expiry.</Text>
          <Text style={styles.paragraph}>13.6 Saathi Credits do not constitute a financial instrument, e-money, or security under applicable Indian law. The Credits programme is a loyalty programme and shall not be governed by RBI regulations applicable to payment instruments.</Text>

          <Text style={styles.subTitle}>14. Intellectual Property</Text>
          <Text style={styles.paragraph}>14.1 All content, technology, trademarks, logos, and materials available on the App are the exclusive intellectual property of MaiHoonNa or its licensors. The Subscriber is granted a limited, non-exclusive, non-transferable licence to use the App solely for the purpose of managing the Subscription.</Text>
          <Text style={styles.paragraph}>14.2 The Subscriber shall not reproduce, distribute, reverse-engineer, or commercially exploit any content or technology forming part of the App without the prior written consent of MaiHoonNa.</Text>

          <Text style={styles.subTitle}>15. Personal Data and Privacy</Text>
          <Text style={styles.paragraph}>
            MaiHoonNa processes the personal data of the Subscriber and the Beneficiary as a Data Fiduciary under the Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025. The categories of personal data collected, the purposes of processing, data-sharing arrangements, call recording, security safeguards, the rights of data principals, and the procedure for exercising those rights and filing complaints are set out in the MaiHoonNa Privacy Policy, which forms an integral part of these T&C and is available on the App and at www.maihoonna.com. By accepting these T&C, the Subscriber acknowledges and consents to the data practices described in the Privacy Policy, including the recording of calls for quality, training, and safety purposes. Data-rights requests may be submitted to privacy@maihoonna.com.
          </Text>

          <Text style={styles.subTitle}>16. Confidentiality</Text>
          <Text style={styles.paragraph}>16.1 Any non-public operational information shared by MaiHoonNa with the Subscriber (including pricing, service protocols, and Mitra training materials) is confidential and shall not be disclosed to third parties without MaiHoonNa's prior written consent.</Text>

          <Text style={styles.subTitle}>17. Care Mitra and Volunteer Safety</Text>
          <Text style={styles.paragraph}>17.1 The safety and well-being of all Care Mitras and Saathi volunteers at the Beneficiary's premises is the joint responsibility of the Subscriber and MaiHoonNa. The Subscriber shall ensure that the Beneficiary's home is free from physical hazards and that no person at the premises poses a threat to the Mitra.</Text>
          <Text style={styles.paragraph}>17.2 If any person at the Beneficiary's premises behaves in a manner that poses a risk to the physical or emotional safety of a Care Mitra or volunteer, MaiHoonNa may immediately withdraw the Mitra and suspend services without refund, pending investigation.</Text>
          <Text style={styles.paragraph}>17.3 The Subscriber shall indemnify MaiHoonNa against any claim, loss, or liability arising from injury to a Care Mitra caused by the negligence or wilful act of the Subscriber, the Beneficiary, or any occupant of the Beneficiary's premises.</Text>

          <Text style={styles.subTitle}>18. Non-Solicitation</Text>
          <Text style={styles.paragraph}>18.1 The Subscriber agrees not to, directly or indirectly, approach, solicit, recruit, or privately engage any Care Mitra, Saathi volunteer, Field Manager, or Partner Network provider introduced through MaiHoonNa, whether during the Subscription period or for 12 months after its expiry or termination.</Text>
          <Text style={styles.paragraph}>18.2 A breach of Clause 18.1 shall entitle MaiHoonNa to terminate the Subscription immediately without refund and to seek liquidated damages equivalent to 3 months of the applicable Subscription Package fee.</Text>

          <Text style={styles.subTitle}>19. Limitation of Liability</Text>
          <Text style={styles.paragraph}>19.1 MaiHoonNa shall not be liable for any indirect, consequential, or incidental loss, including loss of health, property, life, profits, or data arising from the use of or inability to use the services, except where such loss results directly from MaiHoonNa's gross negligence or wilful misconduct.</Text>
          <Text style={styles.paragraph}>19.2 In no event shall MaiHoonNa's total liability to the Subscriber exceed the Subscription Package fee paid by the Subscriber in the 3 months immediately preceding the event giving rise to the claim.</Text>
          <Text style={styles.paragraph}>19.3 MaiHoonNa shall not be liable for the acts, omissions, or negligence of Partner Network providers. The Subscriber's recourse in respect of Partner Network services shall be directly against the relevant partner.</Text>

          <Text style={styles.subTitle}>20. Indemnity</Text>
          <Text style={styles.paragraph}>
            The Subscriber agrees to indemnify, defend, and hold MaiHoonNa and its directors, officers, employees, Care Mitras, and agents harmless from and against any claims, losses, liabilities, and expenses (including reasonable legal fees) arising from: (a) any breach of these T&C by the Subscriber, NOK, or Beneficiary; (b) the Subscriber's provision of inaccurate health information; (c) any injury to a Care Mitra caused by the Subscriber's negligence or wilful act; or (d) any violation of applicable law by the Subscriber.
          </Text>

          <Text style={styles.subTitle}>21. Modification of Terms</Text>
          <Text style={styles.paragraph}>21.1 MaiHoonNa reserves the right to amend these T&C at any time. Amendments shall be notified to the Subscriber via the App at least 15 days before they take effect.</Text>
          <Text style={styles.paragraph}>21.2 Continued use of the App or the services after the effective date of an amendment shall constitute the Subscriber's acceptance of the amended T&C.</Text>
          <Text style={styles.paragraph}>21.3 If the Subscriber objects to any amendment, they may terminate the Subscription within 15 days of the notice, in which case MaiHoonNa shall refund the unused Hours in accordance with Clause 7.3.</Text>

          <Text style={styles.subTitle}>22. Nature of Relationship</Text>
          <Text style={styles.paragraph}>MaiHoonNa is an independent service provider. These T&C do not create a principal-agent, employer-employee, partnership, or joint venture relationship between MaiHoonNa and the Subscriber. Care Mitras are employed or engaged by MaiHoonNa and are not the agents or employees of the Subscriber.</Text>

          <Text style={styles.subTitle}>23. Force Majeure</Text>
          <Text style={styles.paragraph}>MaiHoonNa shall not be liable for any failure or delay in performance of services caused by circumstances beyond its reasonable control, including acts of God, pandemic, epidemic, government orders, curfew, lockdown, civil unrest, natural disasters, or failure of third-party telecommunications infrastructure. In such events, MaiHoonNa shall notify the Subscriber and make reasonable alternative arrangements where possible.</Text>

          <Text style={styles.subTitle}>24. Governing Law and Dispute Resolution</Text>
          <Text style={styles.paragraph}>24.1 These T&C shall be governed by and construed in accordance with the laws of India.</Text>
          <Text style={styles.paragraph}>24.2 The Parties shall attempt to resolve any dispute through good-faith negotiation for 30 days from the date of written notice of the dispute.</Text>
          <Text style={styles.paragraph}>24.3 If unresolved, the dispute shall be referred to and finally settled by arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Gurugram, Haryana. The arbitration shall be conducted by a sole arbitrator mutually agreed upon by the Parties, and proceedings shall be in English.</Text>
          <Text style={styles.paragraph}>24.4 Subject to Clause 24.3, the courts at Gurugram, Haryana shall have exclusive jurisdiction.</Text>

          <Text style={styles.subTitle}>25. General Provisions</Text>
          <Text style={styles.paragraph}>25.1 Entire agreement: These T&C, together with MaiHoonNa's Privacy Policy and the Subscription confirmation, constitute the entire agreement between MaiHoonNa and the Subscriber with respect to the Subscription and supersede all prior representations and understandings.</Text>
          <Text style={styles.paragraph}>25.2 Severability: If any provision of these T&C is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.</Text>
          <Text style={styles.paragraph}>25.3 Waiver: No failure by MaiHoonNa to enforce any provision of these T&C shall constitute a waiver of that provision.</Text>
          <Text style={styles.paragraph}>25.4 Assignment: MaiHoonNa may assign its rights and obligations under these T&C to any successor entity or affiliate with notice to the Subscriber. The Subscriber may not assign their rights or obligations without MaiHoonNa's prior written consent.</Text>
          <Text style={styles.paragraph}>25.5 Notices: All notices under these T&C shall be in writing and delivered by email to the registered email address of the Subscriber, or via in-App notification. Notices to MaiHoonNa shall be sent to care@maihoonna.com.</Text>
          <Text style={styles.paragraph}>25.6 Survival: Clauses 14, 15, 16, 18, 19, 20, and 24 shall survive the termination or expiry of the Subscription.</Text>
          <Text style={styles.paragraph}>By tapping "I Agree" on the MaiHoonNa app, the Subscriber confirms that they have read, understood, and agree to these Terms and Conditions for Subscribers.</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>MaiHoonNa Eldercare Private Limited</Text>{'\n'}
            care@maihoonna.com{'\n'}
            www.maihoonna.com{'\n'}
            Gurugram, Haryana
          </Text>

          <View style={{ height: 24 }} />

          {/* ── Privacy Policy ── */}
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Last Updated:</Text> September 3, 2026
          </Text>
          <Text style={styles.paragraph}>
            MaiHoonNa Eldercare Private Limited ("MaiHoonNa", "we", "us", or "our") respects your privacy and is committed to protecting the personal data of Subscribers and the senior citizens (Beneficiaries) receiving our care services.
          </Text>
          <Text style={styles.paragraph}>
            This Privacy Policy explains what information we collect, why we use it, how we share and protect it, and the rights available to you.
          </Text>

          <Text style={styles.subTitle}>1. Who We Are</Text>
          <Text style={styles.paragraph}>
            MaiHoonNa Eldercare Private Limited operates the MaiHoonNa website, Saathi mobile application, and related eldercare services.
          </Text>
          <Text style={styles.paragraph}>
            MaiHoonNa acts as a <Text style={styles.bold}>Data Fiduciary</Text> under applicable Indian data-protection laws, including the Digital Personal Data Protection Act, 2023 (DPDPA) and applicable rules.
          </Text>

          <Text style={styles.subTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>Depending on how you use our services, we may collect:</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Identity and contact information:</Text> name, age, gender, address, mobile number, and email address.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Health and medical information:</Text> medical history, health conditions, medications, allergies, mobility information, and other care-related information provided to us.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Care and monitoring information:</Text> blood pressure, pulse, SpO2, weight, temperature, medication adherence, visit records, and Care Mitra notes.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Subscription and payment information:</Text> subscription details, billing records, payment-related information, and service usage.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Emergency information:</Text> Next of Kin and emergency-contact details.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Communications:</Text> in-app messages, feedback, surveys, testimonials, and calls with our care or operations teams, including recordings where applicable.</Text>
          <Text style={styles.listItem}>• <Text style={styles.bold}>Saathi Network information:</Text> where applicable, information relating to Saathi Credits and loyalty-wallet activity.</Text>

          <Text style={styles.subTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>We use personal information to:</Text>
          <Text style={styles.listItem}>• Provide and coordinate eldercare services.</Text>
          <Text style={styles.listItem}>• Schedule Care Mitras and manage visits.</Text>
          <Text style={styles.listItem}>• Maintain care and health records.</Text>
          <Text style={styles.listItem}>• Communicate with Subscribers and Beneficiaries through the App, phone, email, SMS, or WhatsApp.</Text>
          <Text style={styles.listItem}>• Coordinate emergency assistance.</Text>
          <Text style={styles.listItem}>• Process subscriptions, payments, and billing.</Text>
          <Text style={styles.listItem}>• Monitor service quality and conduct internal audits.</Text>
          <Text style={styles.listItem}>• Provide customer support.</Text>
          <Text style={styles.listItem}>• Improve the safety, performance, and quality of our services.</Text>
          <Text style={styles.listItem}>• Conduct anonymised or de-identified research and analytics where permitted and appropriately consented to.</Text>

          <Text style={styles.subTitle}>4. How We Share Information</Text>
          <Text style={styles.paragraph}>We may share relevant information, where necessary and legally permitted, with:</Text>
          <Text style={styles.listItem}>• Assigned Care Mitras and Field Managers.</Text>
          <Text style={styles.listItem}>• Authorised family members or Subscribers through the Family Connect dashboard.</Text>
          <Text style={styles.listItem}>• Healthcare and service partners involved in your care, such as physiotherapists, doctors, diagnostic laboratories, or pharmacies.</Text>
          <Text style={styles.listItem}>• Service providers that help us operate our technology and services.</Text>
          <Text style={styles.listItem}>• Government, regulatory, or law-enforcement authorities where required by law.</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We do not sell your personal data.</Text>{'\n'}
            We may use properly anonymised or de-identified information that cannot reasonably be linked to an individual for research, analytics, quality improvement, and service development.
          </Text>

          <Text style={styles.subTitle}>5. Health and Care Information</Text>
          <Text style={styles.paragraph}>
            Health and care information provided through MaiHoonNa may be maintained as part of the Beneficiary's digital care record. Access to such information is restricted to authorised persons who need it to provide or coordinate care. Subscribers can access relevant care information through their authenticated Family Connect account.
          </Text>

          <Text style={styles.subTitle}>6. Call Recording</Text>
          <Text style={styles.paragraph}>Calls with MaiHoonNa's care or operations teams may be recorded for purposes such as:</Text>
          <Text style={styles.listItem}>• Quality assurance</Text>
          <Text style={styles.listItem}>• Training</Text>
          <Text style={styles.listItem}>• Safety</Text>
          <Text style={styles.listItem}>• Service improvement</Text>
          <Text style={styles.listItem}>• Dispute resolution where appropriate</Text>
          <Text style={styles.paragraph}>Where a call is recorded, appropriate notice will be provided as required.</Text>

          <Text style={styles.subTitle}>7. Your Privacy Rights</Text>
          <Text style={styles.paragraph}>Subject to applicable law, you may have rights to:</Text>
          <Text style={styles.listItem}>• Access the personal data we hold about you.</Text>
          <Text style={styles.listItem}>• Correct inaccurate or incomplete information.</Text>
          <Text style={styles.listItem}>• Request deletion of your personal data, subject to legal retention requirements.</Text>
          <Text style={styles.listItem}>• Withdraw consent where processing is based on consent.</Text>
          <Text style={styles.listItem}>• Exercise applicable rights regarding nomination or access to your data.</Text>
          <Text style={styles.listItem}>• Raise a complaint regarding the handling of your personal data.</Text>
          <Text style={styles.paragraph}>To exercise your privacy rights, contact: <Text style={styles.bold}>Privacy: privacy@maihoonna.com</Text>. We may require reasonable verification before processing a request.</Text>

          <Text style={styles.subTitle}>8. Data Security</Text>
          <Text style={styles.paragraph}>
            MaiHoonNa uses appropriate technical and organisational safeguards designed to protect personal information against unauthorised access, alteration, disclosure, loss, or destruction. Access to health and care information is limited to authorised personnel on a need-to-know basis.
          </Text>

          <Text style={styles.subTitle}>9. Data Retention</Text>
          <Text style={styles.paragraph}>We retain personal information only for as long as reasonably necessary to:</Text>
          <Text style={styles.listItem}>• Provide our services.</Text>
          <Text style={styles.listItem}>• Maintain care records.</Text>
          <Text style={styles.listItem}>• Fulfil legal, tax, accounting, and regulatory obligations.</Text>
          <Text style={styles.listItem}>• Resolve disputes.</Text>
          <Text style={styles.listItem}>• Prevent fraud and misuse.</Text>
          <Text style={styles.listItem}>• Protect our legal rights.</Text>
          <Text style={styles.paragraph}>When information is no longer required, we may securely delete or anonymise it, subject to applicable legal requirements.</Text>

          <Text style={styles.subTitle}>10. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            MaiHoonNa is primarily designed as a senior-care and family-support service and is not intended for children below the applicable minimum age. We do not knowingly collect personal information directly from children where such collection is prohibited by applicable law. Any suspected child-safety concern should be reported through the App or to: <Text style={styles.bold}>Child Safety: childsafety@maihoonna.com</Text>
          </Text>

          <Text style={styles.subTitle}>11. Marketing and Testimonials</Text>
          <Text style={styles.paragraph}>
            We may use anonymised feedback, testimonials, or survey responses to improve or promote our services. We will obtain appropriate additional consent before using identifiable photographs, videos, or named testimonials where required. You may decline optional marketing or promotional activities without affecting your access to core services.
          </Text>

          <Text style={styles.subTitle}>12. Grievances and Contact</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Privacy:</Text> privacy@maihoonna.com{'\n'}
            <Text style={styles.bold}>General Grievances:</Text> grievance@maihoonna.com{'\n'}
            <Text style={styles.bold}>Customer Support:</Text> care@maihoonna.com
          </Text>
          <Text style={styles.paragraph}>You may also have the right to approach the applicable data-protection authority under Indian law.</Text>

          <Text style={styles.subTitle}>13. Updates to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy when our services, legal requirements, or data-processing practices change. Material changes will be communicated through appropriate channels, where required by applicable law. The latest version of this Privacy Policy will be available through the MaiHoonNa App and website.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>MaiHoonNa Eldercare Private Limited</Text>{'\n'}
            Gurugram, Haryana, India{'\n'}{'\n'}
            <Text style={styles.bold}>मैं हूँ ना — I am here for you.</Text>
          </Text>

          <View style={{ height: 24 }} />

          {/* ── Child Safety Standards ── */}
          <Text style={styles.sectionTitle}>Child Safety Standards</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Applies to:</Text> Saathi App and MaiHoonNa services{'\n'}
            <Text style={styles.bold}>Operated by:</Text> MaiHoonNa Eldercare Private Limited{'\n'}
            <Text style={styles.bold}>Last Updated:</Text> September 3, 2026
          </Text>
          
          <Text style={styles.subTitle}>Our Commitment</Text>
          <Text style={styles.paragraph}>
            MaiHoonNa is committed to providing a safe and respectful environment for everyone. We have <Text style={styles.bold}>zero tolerance</Text> for child sexual abuse, child sexual exploitation, child sexual abuse material (CSAM), grooming, trafficking, or any conduct that may endanger a child.
          </Text>
          <Text style={styles.paragraph}>
            For this policy, a <Text style={styles.bold}>child</Text> means any person under 18 years of age, unless a higher age is required by applicable law.
          </Text>

          <Text style={styles.subTitle}>Prohibited Conduct</Text>
          <Text style={styles.paragraph}>Users must not use the Saathi App or any MaiHoonNa service to:</Text>
          <Text style={styles.listItem}>• Create, upload, share, request, store, or distribute CSAM or content that sexually exploits children.</Text>
          <Text style={styles.listItem}>• Sexualize, groom, manipulate, threaten, coerce, or exploit a child.</Text>
          <Text style={styles.listItem}>• Solicit or request inappropriate photographs, videos, personal information, contact details, or location information from a child.</Text>
          <Text style={styles.listItem}>• Facilitate or arrange sexual abuse, exploitation, trafficking, or inappropriate contact involving a child.</Text>
          <Text style={styles.listItem}>• Harass, bully, threaten, intimidate, or abuse a child.</Text>
          <Text style={styles.listItem}>• Impersonate another person or authority to deceive, manipulate, or endanger a child.</Text>
          <Text style={styles.listItem}>• Attempt to bypass safety, reporting, moderation, or account-restriction mechanisms.</Text>
          <Text style={styles.listItem}>• Encourage, assist, promote, or facilitate any prohibited conduct.</Text>
          <Text style={styles.paragraph}>
            Violations may result in <Text style={styles.bold}>content removal, account suspension or termination, and reporting to appropriate authorities where required or appropriate.</Text>
          </Text>

          <Text style={styles.subTitle}>Reporting a Child-Safety Concern</Text>
          <Text style={styles.paragraph}>
            If you encounter suspected child exploitation, abuse, grooming, CSAM, or any other child-safety concern, please report it immediately using the <Text style={styles.bold}>Report, Help, Support, or Contact Us</Text> options available in the Saathi App.
          </Text>
          <Text style={styles.paragraph}>
            You may also contact our Child Safety Point of Contact:{'\n'}
            <Text style={styles.bold}>Child Safety / Trust & Safety Team</Text>{'\n'}
            <Text style={styles.bold}>Email:</Text> childsafety@maihoonna.com{'\n'}
            <Text style={styles.bold}>Grievance:</Text> grievance@maihoonna.com{'\n'}
            <Text style={styles.bold}>Phone:</Text> +91-124-4001234
          </Text>
          <Text style={styles.paragraph}>
            When reporting, please provide relevant information such as the user/profile involved, date and time, description of the incident, and available non-explicit supporting information.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Do not download, copy, forward, store, or redistribute suspected CSAM.</Text> If a child is in immediate danger, contact local emergency services or law enforcement immediately.
          </Text>

          <Text style={styles.subTitle}>Our Safety Measures</Text>
          <Text style={styles.paragraph}>Where user interaction or content sharing is available, MaiHoonNa may use safety measures including:</Text>
          <Text style={styles.listItem}>• User reporting and complaint mechanisms.</Text>
          <Text style={styles.listItem}>• Review and removal of prohibited content.</Text>
          <Text style={styles.listItem}>• Blocking or restricting abusive users where applicable.</Text>
          <Text style={styles.listItem}>• Account suspension or termination for serious violations.</Text>
          <Text style={styles.listItem}>• Internal escalation and investigation procedures.</Text>
          <Text style={styles.listItem}>• Preservation of relevant information where legally required.</Text>
          <Text style={styles.listItem}>• Cooperation with lawful requests from authorities.</Text>
          <Text style={styles.listItem}>• Periodic review and improvement of our safety procedures.</Text>

          <Text style={styles.subTitle}>Enforcement</Text>
          <Text style={styles.paragraph}>
            MaiHoonNa may take immediate action when necessary to protect users, prevent further harm, preserve evidence, or comply with legal obligations.
          </Text>
          <Text style={styles.paragraph}>
            Confirmed or suspected serious child-safety violations may be reported to appropriate law-enforcement or child-protection authorities in accordance with applicable law.
          </Text>

          <Text style={styles.subTitle}>Child Safety Contact</Text>
          <Text style={styles.paragraph}>
            Our designated Child Safety Point of Contact coordinates child-safety reports, investigations, enforcement actions, and relevant platform or regulatory requests.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Email:</Text> childsafety@maihoonna.com{'\n'}
            <Text style={styles.bold}>Grievance:</Text> grievance@maihoonna.com
          </Text>

          <Text style={styles.subTitle}>Policy Updates</Text>
          <Text style={styles.paragraph}>
            We may update these Child Safety Standards to reflect changes in our services, safety practices, legal requirements, or Google Play and Apple App Store requirements. The latest version is available on our website.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>MaiHoonNa Eldercare Private Limited</Text>{'\n'}
            Gurugram, Haryana, India{'\n'}
            care@maihoonna.com{'\n'}
            privacy@maihoonna.com{'\n'}
            childsafety@maihoonna.com
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>

        {requireConsent ? (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setIsChecked(!isChecked)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                {isChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I have read and accept the Terms of Service, Privacy Policy, and Child Safety Standards.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !isChecked && styles.actionButtonDisabled]}
              onPress={handleAction}
              disabled={!isChecked}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Agree & Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.footer, { borderTopWidth: 0 }]}>
             <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: scale(16),
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: scale(16),
    padding: scale(4),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(20),
  },
  mainTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: scale(20),
    color: '#111827',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: scale(18),
    color: '#FE6700',
    marginTop: scale(24),
    marginBottom: scale(12),
  },
  subTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: scale(15),
    color: '#333',
    marginTop: scale(16),
    marginBottom: scale(8),
  },
  paragraph: {
    fontFamily: 'Poppins-Regular',
    fontSize: scale(13),
    color: '#555',
    lineHeight: scale(20),
    marginBottom: scale(12),
  },
  listItem: {
    fontFamily: 'Poppins-Regular',
    fontSize: scale(13),
    color: '#555',
    lineHeight: scale(20),
    marginBottom: scale(8),
    paddingLeft: scale(8),
  },
  bold: {
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  footer: {
    padding: scale(20),
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    }),
    elevation: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(6),
    borderWidth: 2,
    borderColor: '#FE6700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  checkboxActive: {
    backgroundColor: '#FE6700',
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: scale(13),
    color: '#333',
    lineHeight: scale(18),
  },
  actionButton: {
    backgroundColor: '#FE6700',
    paddingVertical: scale(14),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#FFB380',
  },
  actionButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: scale(15),
    color: '#FFFFFF',
  },
});
