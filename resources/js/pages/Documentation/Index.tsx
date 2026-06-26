import React, { useState } from 'react';
import { BookOpen, LayoutDashboard, Stamp, Gift, Hash, CreditCard, Users, QrCode, Ticket, Search, X, Store } from 'lucide-react';
import Dashboard from "../../../images/documentation/dashboard.png";
import Register from "../../../images/documentation/register.png";
import Validate from "../../../images/documentation/validate.png";
import Login from "../../../images/documentation/login.png";
import CardTemplate from "../../../images/documentation/card-template.png";
import QRStudio from "../../../images/documentation/qr-studio.png";
import QR from "../../../images/documentation/qr.png";
import CustomerDashboard from "../../../images/documentation/customer-dashboard.png";
const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const navigation = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'staff-accounts', label: 'Staff Accounts', icon: Store },
    { id: 'issue-stamp', label: 'Issue Stamp', icon: Stamp },
    { id: 'perk-claims', label: 'Perk Claims', icon: Gift },
    { id: 'stamp-codes', label: 'Stamp Codes', icon: Hash },
    { id: 'card-templates', label: 'Loyalty Cards', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'qr-studio', label: 'QR Studio', icon: QrCode },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    // { id: 'settings', label: 'Settings', icon: Settings },
  ];

  type DocumentationSubsection = {
    title: string;
    content?: string;
    items?: string[];
    steps?: string[];
    image?: React.ReactNode;
  };

  type DocumentationSection = {
    title: string;
    description: string;
    sections: DocumentationSubsection[];
  };

  type SearchResult = {
    sectionId: string;
    title: string;
    description: string;
    matchType: string;
  };

  const content: Record<string, DocumentationSection> = {
    overview: {
      title: 'System Overview',
      description: 'Welcome to the StampBayan documentation. This comprehensive guide will help you understand and utilize all features of the platform.',
      sections: [
        {
          title: 'What is StampBayan?',
          content: 'A powerful SaaS platform designed to help businesses create, manage, and track customer loyalty programs through digital stamp cards, perks, and rewards.'
        },
        {
          title: 'Key Features',
          items: [
            'Digital stamp card creation and management',
            'Real-time customer engagement tracking',
            'Customizable loyalty cards',
            'QR code generation for easy stamp distribution',
            'Perk redemption system',
            'Customer management and analytics',
            'Support ticket system'
          ]
        },
        {
          title: 'Getting Started',
          content: 'Navigate through the modules using the sidebar menu. Each section provides specific functionality to manage different aspects of your loyalty program.'
        }
      ]
    },
    'getting-started': {
      title: 'Getting Started - Basic Usage',
      description: 'Follow these simple steps to set up your first loyalty program and start engaging customers.',
      sections: [
        {
          title: 'Quick Setup Guide',
          content: 'Get your loyalty program up and running in just 5 easy steps. This guide will walk you through the entire process from registration to customer engagement.',
          image: <img src={Dashboard} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'Step 1: Register Your Account',
          content: 'Create your business account to get started with the platform.',
          steps: [
            'Visit the registration page',
            'Enter your business name, username, email address, and password',
            'Click "Create Account"',
            'Check your email inbox for the verification email'
          ],
           image: <img src={Register} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'Step 2: Validate Your Email',
          content: 'Verify your email address to activate your account and ensure secure access.',
          steps: [
            'Open the verification email sent to your inbox',
            'Click on the verification link',
            'You will be redirected to the login page',
            'Your account is now activated and ready to use'
          ],
      image: <img src={Validate} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'Step 3: Login to Your Account',
          content: 'Access your dashboard using your credentials.',
          steps: [
            'Go to the login page',
            'Enter your registered email and password',
            'Click "Login"',
            'You will be taken to your main dashboard'
          ],
      image: <img src={Login} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'Step 4: Create Your Loyalty Card Template',
          content: 'Design your first loyalty card that customers will use to collect stamps.',
          steps: [
            'Navigate to "Loyalty Cards" from the sidebar menu',
            'Click "Create New Template"',
            'Enter card details: name, description, and reward information etc.',
            'Set the number of stamps required to earn a reward',
            'Customize the card design: colors, logo, and images',
            'Define Mechanics',
            'Click "Create Card Template"'
          ],
    image: <img src={CardTemplate} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'Step 5: Design and Print Your QR Code',
          content: 'Create a custom QR code that customers will scan to register and collect stamps.',
          steps: [
            'Go to "QR Studio" from the sidebar menu',
            'Customize the QR code design: add your logo, change background desing, heading, subheading add text colors',
            'Click: "Save Settings"',
            'Download the QR',
            'Print the QR code poster'
          ],
      image: <img src={QRStudio} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'Step 6: Display and Start Collecting Customers',
          content: 'Place your QR code where customers can easily scan it.',
          items: [
            'Display the printed QR code at your store entrance',
            'Place it near the checkout counter',
            'Add it to table tents or menu stands',
            'Include it on receipts or promotional materials',
            'Share it on social media'
          ],
     image: <img src={QR} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'How Customers Register',
          content: 'Once your QR code is displayed, customers can easily join your loyalty program:',
          steps: [
            'Customer scans the QR code with their phone camera',
            'They are directed to the registration page',
            'Customer enters their username, email, and phone number',
            'They receive their digital loyalty card instantly',
            'Customer can start collecting stamps immediately'
          ],
         image: <img src={CustomerDashboard} alt="Quick Setup Guide" className="w-full rounded-lg shadow-md mb-2" />
        },
        {
          title: 'What Happens Next?',
          content: 'After setup, you can start issuing stamps to customers when they make purchases, and you can track everything from your dashboard.'
        },
        {
          title: 'Tips for Success',
          items: [
            'Make your QR code visible and easy to access',
            'Train staff on how to issue stamps',
            'Promote your loyalty program on social media',
            'Offer a welcome bonus for first-time registrations',
            'Regularly review your dashboard analytics',
          ]
        },
        {
          title: 'Need Help?',
          content: 'If you encounter any issues during setup, visit the Tickets module to submit a support request, or explore other sections of this documentation for detailed information about each feature.'
        }
      ]
    },
    dashboard: {
      title: 'Dashboard',
      description: 'Your central hub for monitoring loyalty program performance and key metrics.',
      sections: [
        {
          title: 'Overview',
          content: 'The Dashboard provides a real-time snapshot of your loyalty program performance, displaying critical metrics and insights at a glance.'
        },
        {
          title: 'Key Metrics',
          items: [
            'Total active customers',
            'Stamps issued',
            'Total new customers',
            'Customer traffic by day',
            'Customer visit frequency',
          ]
        }
      ]
    },
    'issue-stamp': {
      title: 'Issue Stamp',
      description: 'Award stamps to customers for purchases or activities.',
      sections: [
        {
          title: 'How to Issue Stamps',
          steps: [
            'Choose the loyalty card template',
            'Using your customer account, ask them to scan the code or input it manually',
            'Confirm the stamp issuance'
          ]
        },
        {
          title: 'Best Practices',
          content: 'Always verify customer identity before issuing stamps. Use transaction references to track stamp sources and maintain audit trails for accountability.'
        }
      ]
    },
    'perk-claims': {
      title: 'Perk Claims',
      description: 'Manage customer reward redemptions and track perk usage.',
      sections: [
        {
          title: 'Viewing Claims',
          content: 'Access a comprehensive list of all perk redemptions, including available, total claims, and redeemed claims. Filter, customer, or reward card.'
        },
        {
          title: 'Claim Process',
          steps: [
            'Customer reaches required stamp threshold',
            'Customer initiates perk claim',
            'Staff verifies eligibility',
            'Claim is approved and fulfilled',
            'Stamps are deducted from customer card'
          ]
        },
        {
          title: 'Managing Claims',
          items: [
            'redeem pending claims',
            'undo redeemed claims',
            'Add remarks',
            'Handle disputed claims'
          ]
        }
      ]
    },
    'staff-accounts': {
  title: 'Staff Accounts',
  description: 'Create and manage staff accounts.',
  sections: [
    {
      title: 'What are Staff Accounts?',
      content:
        'Staff accounts allow staff members to log in separately. Staff members have more limited permissions than the owner.'
    },
    {
      title: 'How can my staff log in?',
      items: [
        'https://stampbayan.com/staff/login'
      ]
    }
  ]
},

    'stamp-codes': {
      title: 'Stamp Codes',
      description: 'Create and manage unique codes for stamp distribution.',
      sections: [
        {
          title: 'What are Stamp Codes?',
          content: 'Unique alphanumeric codes that customers can enter to receive stamps automatically. Ideal for promotional campaigns, social media contests, or remote stamp distribution.'
        },
        {
          title: 'Code Management',
          items: [
            'Track code usage statistics',
            'Monitor fraud and abuse'
          ]
        }
      ]
    },
    'card-templates': {
      title: 'Loyalty Cards',
      description: 'Design and customize loyalty card layouts and rewards.',
      sections: [
        {
          title: 'Template Creation',
          content: 'Build custom loyalty cards tailored to your business needs. Define stamp requirements, rewards, branding, and expiration rules.'
        },
        {
          title: 'Template Configuration',
          items: [
            'Card name and description',
            'Number of stamps required',
            'Reward/perk details',
            'Visual design (colors, logo, images)',
            'Expiration settings',
            'Terms and conditions'
          ]
        },
        {
          title: 'Managing Templates',
          steps: [
            'Create new templates',
            'Edit templates',
            'Delte outdated templates',
          ]
        }
      ]
    },
    customers: {
      title: 'Customers',
      description: 'Comprehensive customer relationship management.',
      sections: [
        {
          title: 'Customer Database',
          content: 'Access detailed profiles for all customers enrolled in your loyalty program and engagement history.'
        },
        {
          title: 'Customer Information',
          items: [
            'Personal details (usernname, email, phone)',
            'Total stamps earned',
            'Perks claimed',
            'Join date and last activity',
          ]
        },
      ]
    },
    'qr-studio': {
      title: 'QR Studio',
      description: 'Generate and customize your QR Code for store display',
      sections: [
        {
          title: 'Creating QR Codes',
          steps: [
            'Customize design (colors, logo, heading and subheading)',
            'Preview QR code',
            'Download',
            'Print or share digitally'
          ]
        },
        {
          title: 'Best Practices',
          content: 'Place QR codes in high-visibility areas. Test scans before distribution. Use high contrast colors for better scanability. Include instructions for first-time users.'
        }
      ]
    },
    tickets: {
      title: 'Tickets',
      description: 'Support and issue resolution system.',
      sections: [
        {
          title: 'Ticket Management',
          content: 'We support ticket system. Track resolution times and customer satisfaction.'
        },
        {
          title: 'Ticket Workflow',
          steps: [
            'You submit a ticket including the information of the issue',
            'Ticket is assigned to support team',
            'Staff investigates and responds',
            'Issue is resolved',
            'Ticket is closed with resolution notes',
          ]
        },
        {
          title: 'Ticket Features',
          items: [
            'Priority levels (low, medium, high, urgent)',
            'Internal notes and communication',
            'Attachment support',
            'Status tracking',
          ]
        }
      ]
    },
    // settings: {
    //   title: 'Settings',
    //   description: 'Configure system preferences and business rules.',
    //   sections: [
    //     {
    //       title: 'General Settings',
    //       items: [
    //         'Business name and contact information',
    //         'Timezone and locale',
    //         'Currency settings',
    //         'Notification preferences',
    //         'Email templates'
    //       ]
    //     },
    //     {
    //       title: 'Loyalty Program Settings',
    //       items: [
    //         'Default stamp expiration rules',
    //         'Claim approval requirements',
    //         'Fraud detection thresholds',
    //         'Customer enrollment options',
    //         'Reward redemption rules'
    //       ]
    //     },
    //     {
    //       title: 'User Management',
    //       items: [
    //         'Add/remove staff users',
    //         'Assign roles and permissions',
    //         'Configure access levels',
    //         'View audit logs',
    //         'Manage API keys'
    //       ]
    //     },
    //     {
    //       title: 'Integrations',
    //       content: 'Connect third-party services like email marketing platforms, POS systems, and analytics tools to enhance your loyalty program functionality.'
    //     }
    //   ]
    // }
  };

  const searchResults = (() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const lowerSearch = searchTerm.toLowerCase();

    Object.entries(content).forEach(([sectionId, section]) => {
      if (
        section.title.toLowerCase().includes(lowerSearch) ||
        section.description.toLowerCase().includes(lowerSearch)
      ) {
        results.push({
          sectionId,
          title: section.title,
          description: section.description,
          matchType: 'section'
        });
      }

      section.sections.forEach((subsection) => {
        if (subsection.title.toLowerCase().includes(lowerSearch)) {
          results.push({
            sectionId,
            title: `${section.title} - ${subsection.title}`,
            description: subsection.content || '',
            matchType: 'subsection'
          });
        }

        if (subsection.content && subsection.content.toLowerCase().includes(lowerSearch)) {
          results.push({
            sectionId,
            title: `${section.title} - ${subsection.title}`,
            description: subsection.content,
            matchType: 'content'
          });
        }

        if (subsection.items) {
          subsection.items.forEach((item: string) => {
            if (item.toLowerCase().includes(lowerSearch)) {
              results.push({
                sectionId,
                title: `${section.title} - ${subsection.title}`,
                description: item,
                matchType: 'item'
              });
            }
          });
        }

        if (subsection.steps) {
          subsection.steps.forEach((step: string) => {
            if (step.toLowerCase().includes(lowerSearch)) {
              results.push({
                sectionId,
                title: `${section.title} - ${subsection.title}`,
                description: step,
                matchType: 'step'
              });
            }
          });
        }
      });
    });

    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.sectionId === result.sectionId && r.title === result.title)
    );

    return uniqueResults.slice(0, 10);
  })();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(value.trim().length > 0);
  };

  const handleSearchResultClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSearchTerm('');
    setIsSearching(false);
  };

  const renderContent = (section: DocumentationSection) => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{section.title}</h1>
          <p className="text-base sm:text-lg text-gray-600">{section.description}</p>
        </div>

        {section.sections.map((subsection: DocumentationSubsection, idx: number) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">{subsection.title}</h2>
            
            {subsection.content && (
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">{subsection.content}</p>
            )}

            {subsection.image}

            {subsection.items && (
              <ul className="space-y-2">
                {subsection.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {subsection.steps && (
              <ol className="space-y-3">
                {subsection.steps.map((step: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold mr-3">{i + 1}</span>
                    <span className="text-sm sm:text-base text-gray-700 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearching(false);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {isSearching && (
            <div className="mt-2 relative">
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchResultClick(result.sectionId)}
                        className="w-full text-left p-4 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900 mb-1 text-sm sm:text-base">{result.title}</div>
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">{result.description}</div>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{result.matchType}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm sm:text-base">No results found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">StampBayan Documentation</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsSearching(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-500">Last updated: Nov 2025</p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 overflow-x-auto">
          <div className="flex items-center px-2 py-2 gap-1">
            {navigation.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsSearching(false);
                  }}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {renderContent(content[activeSection])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
