import prisma from './app/core/database';

async function main() {
  await prisma.websiteContent.upsert({
    where: { pageKey: 'sathi_page' },
    update: {},
    create: {
      pageKey: 'sathi_page',
      content: {
        hero: {
          title: "Companionship that doesn't run on the clock.",
          subtitle: "Community volunteers who visit for company, conversation, or assistance",
          stats: [
            { number: "340+", label: "Active Saathis" },
            { number: "8,200+", label: "Hours given" },
            { number: "100%", label: "Background verified" }
          ]
        },
        steps: [
          {
            title: "Apply & submit documents",
            description: "Fill in the enrollment form below. Submit your Aadhaar, photos, and references."
          },
          {
            title: "Background verification",
            description: "We run a thorough BGV — Aadhaar-linked identity check and local references."
          },
          {
            title: "Care Manager approval & onboarding",
            description: "Our Care Manager reviews your profile, conducts a brief interview, and activates your status."
          },
          {
            title: "Matched by location",
            description: "You're assigned to seniors within a walkable or short driving distance in your neighborhood."
          },
          {
            title: "Every hour tracked & rewarded",
            description: "Geo-fenced check-in and check-out confirms every visit. Earn points for your time."
          }
        ],
        rewards: [
          {
            title: "Saathi Points",
            description: "Every verified hour earns points. Redeem for vouchers, merchandise, or community features."
          },
          {
            title: "Recognition tiers",
            description: "Rise from New → Senior → Top → Legend Saathi. Each tier unlocks new benefits."
          },
          {
            title: "Verified certificate",
            description: "Receive a MaiHoonNa Volunteer Certificate — valued by universities and employers."
          },
          {
            title: "Community",
            description: "Join monthly Saathi meetups, WhatsApp groups, and specialized caregiving workshops."
          }
        ]
      }
    }
  });
  console.log("Seeded sathi_page content");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
