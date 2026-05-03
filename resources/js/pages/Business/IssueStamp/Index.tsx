import ModuleHeading from "@/components/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StampCode {
  code: string;
  qr_url: string;
  created_at: string;
}

interface LoyaltyCard {
  id: number;
  name: string;
}

interface Props {
  code: {
    success: boolean;
    code: string;
    qr_url: string;
    created_at: string;
  };
  cards: LoyaltyCard[];
  loyalty_card_id?: string;
}

export default function Index({ code, cards, loyalty_card_id }: Props) {
  const [loading, setLoading] = useState(false);
  const [downloadingOffline, setDownloadingOffline] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>(
     loyalty_card_id?.toString || cards.length > 0 ? cards[0].id.toString() : ""
  );
  const [numberOfStamps, setNumberOfStamps] = useState<number>(1);
  const [numberOfStampsError, setNumberOfStampsError] = useState<string | null>(null);

  useEffect(() => {
    if (loyalty_card_id) {
      setSelectedCardId(loyalty_card_id.toString());
    }
  }, [loyalty_card_id]);


  const [error, setError] = useState<string | null>(null);

  const generateCode = () => {
    if (!selectedCardId) {
      setError("Please select a loyalty card");
      return;
    }

        if (numberOfStamps < 1) {
            setNumberOfStampsError('Please enter a valid number of stamps');
            setLoading(false);
            return;
        }

    setLoading(true);
    setError(null);
    setNumberOfStampsError(null);



    router.get('/business/issue-stamp', { 
      loyalty_card_id: selectedCardId,
      number_of_stamps: numberOfStamps
    });
    
    setLoading(false);
  };

  const generateNewCode = () => {
    if (!selectedCardId) {
      setError("Please select a loyalty card");
      return;
    }

    if (numberOfStamps < 1) {
        setNumberOfStampsError('Please enter a valid number of stamps');
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    setNumberOfStampsError(null);
    
    

    router.get('/business/issue-stamp', {
        loyalty_card_id: selectedCardId,
        number_of_stamps: numberOfStamps,
    });

    setLoading(false);
  };

  const downloadOfflineStamps = async () => {
    setDownloadingOffline(true);
    setError(null);

    try {
      const response = await fetch(`/business/issue-stamps/generate-offline?id=${selectedCardId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate offline stamps');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loyalty-stamps-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download offline stamps. Please try again.');
      console.error('Download error:', err);
    } finally {
      setDownloadingOffline(false);
    }
  };

  return (
      <AppLayout>
          <Head title="Issue Stamp" />
          <div className="mx-auto w-full max-w-2xl sm:mt-6 sm:px-6 md:mt-8 lg:px-8">
              {!code.success ? (
                  <div className="rounded-lg bg-white p-6 shadow sm:p-8">
                      <div className="mb-6 text-center">
                          <div className="mb-4 sm:mb-6">
                              <svg
                                  className="mx-auto h-16 w-16 text-gray-400 sm:h-20 sm:w-20"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                  />
                              </svg>
                          </div>

                          <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                              Ready to Issue a Stamp?
                          </h3>
                          <p className="mb-6 px-2 text-sm text-gray-600 sm:text-base">
                              Select a loyalty card and generate a unique code
                              for your customer.
                          </p>
                      </div>

                      {/* Loyalty Card Selection */}
                      <div className="mb-6">
                          {cards.length > 0 ? (
                              <div className="flex flex-col gap-3">
                                  <div>
                                      <label
                                          htmlFor="loyalty-card"
                                          className="mb-2 block text-sm font-medium text-gray-700"
                                      >
                                          Select Loyalty Card
                                      </label>
                                      <Select
                                          value={selectedCardId}
                                          onValueChange={setSelectedCardId}
                                      >
                                          <SelectTrigger className="w-full">
                                              <SelectValue placeholder="Select a loyalty card" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {cards.map((card) => (
                                                  <SelectItem
                                                      key={card.id}
                                                      value={card.id.toString()}
                                                  >
                                                      {card.name}
                                                  </SelectItem>
                                              ))}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div>
                                      <label
                                          htmlFor="loyalty-card"
                                          className="mb-2 block text-sm font-medium text-gray-700"
                                      >
                                          Number of Stamps
                                      </label>
                                      <Input
                                          type="number"
                                          min="1"
                                          value={numberOfStamps}
                                          onChange={(e) =>
                                              setNumberOfStamps(
                                                  parseInt(e.target.value) || 0,
                                              )
                                          }
                                      />
                                      {numberOfStampsError && (
                                          <p className="mt-1 text-sm text-red-600">
                                              {numberOfStampsError}
                                          </p>
                                      )}
                                  </div>
                              </div>
                          ) : (
                              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                                  No loyalty cards available. Please create a
                                  loyalty card first.
                              </div>
                          )}
                      </div>

                      {error && (
                          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                              {error}
                          </div>
                      )}

                      <div className="space-y-3">
                          <button
                              onClick={generateCode}
                              disabled={loading || cards.length === 0}
                              className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent/70 disabled:cursor-not-allowed disabled:bg-accent/60"
                          >
                              {loading ? 'Generating...' : 'Generate Code'}
                          </button>

                          <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-300"></div>
                              </div>
                              <div className="relative flex justify-center text-sm">
                                  <span className="bg-white px-2 text-gray-500">
                                      Or
                                  </span>
                              </div>
                          </div>

                          <button
                              onClick={downloadOfflineStamps}
                              disabled={
                                  downloadingOffline || cards.length === 0
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                          >
                              {downloadingOffline ? (
                                  <>
                                      <svg
                                          className="h-5 w-5 animate-spin text-white"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                      >
                                          <circle
                                              className="opacity-25"
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                          ></circle>
                                          <path
                                              className="opacity-75"
                                              fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                      </svg>
                                      <span>Generating Offline Stamps...</span>
                                  </>
                              ) : (
                                  <>
                                      <svg
                                          className="h-5 w-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                      </svg>
                                      <span>
                                          Download Offline Stamps (8 tickets)
                                      </span>
                                  </>
                              )}
                          </button>

                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                              <div className="flex items-start gap-2">
                                  <svg
                                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                  >
                                      <path
                                          fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"
                                      />
                                  </svg>
                                  <p>
                                      Offline stamps are perfect for events or
                                      areas without internet. Print 8 tickets at
                                      once and distribute to customers.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="rounded-lg bg-white p-6 shadow sm:p-8">
                      <div className="mb-4 text-center sm:mb-6">
                          <div className="mb-3 inline-block rounded-full bg-green-100 p-2 sm:mb-4">
                              <svg
                                  className="h-6 w-6 text-green-600 sm:h-8 sm:w-8"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                  />
                              </svg>
                          </div>
                          <h3 className="mb-1 text-lg font-semibold text-gray-900 sm:text-xl">
                              Code Generated Successfully
                          </h3>
                          <p className="text-xs text-gray-500 sm:text-sm">
                              Generated on {code.created_at}
                          </p>
                          <p className="text-xs font-bold text-gray-500 sm:text-sm">
                              Number of Stamps: {code.number_of_stamps}
                          </p>
                      </div>

                      <div className="mb-4 border-t border-b border-gray-200 py-4 sm:mb-6 sm:py-6">
                          <div className="mb-4 flex justify-center sm:mb-6">
                              <img
                                  src={code.qr_url}
                                  alt="QR Code"
                                  className="h-48 w-48 rounded-lg border-2 border-gray-200 sm:h-56 sm:w-56 md:h-64 md:w-64"
                              />
                          </div>

                          <div className="px-2 text-center">
                              <p className="mb-2 text-xs text-gray-600 sm:text-sm">
                                  Or enter code manually:
                              </p>
                              <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 sm:px-6 sm:py-3">
                                  <p className="font-mono text-xl font-bold tracking-wider break-all text-gray-900 sm:text-2xl md:text-3xl">
                                      {code.code}
                                  </p>
                              </div>
                          </div>
                      </div>

                      <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:mb-6 sm:p-4">
                          <div className="flex items-start">
                              <svg
                                  className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-yellow-600 sm:mr-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                              </svg>
                              <div>
                                  <p className="text-xs font-medium text-yellow-800 sm:text-sm">
                                      Important
                                  </p>
                                  <p className="mt-1 text-xs text-yellow-700 sm:text-sm">
                                      This code will expire in 15 minutes if not
                                      used. Customer must scan or enter the code
                                      in their app.
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Loyalty Card Selection for New Code */}
                      <div className="mb-4">
                          <div>
                              <label
                                  htmlFor="loyalty-card-new"
                                  className="mb-2 block text-sm font-medium text-gray-700"
                              >
                                  Select Loyalty Card for New Code
                              </label>
                              <Select
                                  value={selectedCardId}
                                  onValueChange={setSelectedCardId}
                              >
                                  <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select a loyalty card" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {cards.map((card) => (
                                          <SelectItem
                                              key={card.id}
                                              value={card.id.toString()}
                                          >
                                              {card.name}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              {error && (
                                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                      {error}
                                  </div>
                              )}
                          </div>

                          <div className="mt-4">
                              <label
                                  htmlFor="loyalty-card"
                                  className="mb-2 block text-sm font-medium text-gray-700"
                              >
                                  Number of Stamps
                              </label>
                              <Input
                                  type="number"
                                  min="1"
                                  value={numberOfStamps}
                                  onChange={(e) =>
                                      setNumberOfStamps(
                                          parseInt(e.target.value) || 0,
                                      )
                                  }
                              />
                              {numberOfStampsError && (
                                  <p className="mt-1 text-sm text-red-600">
                                      {numberOfStampsError}
                                  </p>
                              )}
                          </div>
                      </div>

                      <div className="space-y-3">
                          <button
                              onClick={generateNewCode}
                              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/70 sm:px-6 sm:py-3 sm:text-base"
                          >
                              Generate New Code
                          </button>

                          <button
                              onClick={downloadOfflineStamps}
                              disabled={downloadingOffline}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:px-6 sm:py-3 sm:text-base"
                          >
                              {downloadingOffline ? (
                                  <>
                                      <svg
                                          className="h-5 w-5 animate-spin text-white"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                      >
                                          <circle
                                              className="opacity-25"
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                          ></circle>
                                          <path
                                              className="opacity-75"
                                              fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                      </svg>
                                      <span>Generating...</span>
                                  </>
                              ) : (
                                  <>
                                      <svg
                                          className="h-5 w-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                      >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                      </svg>
                                      <span>Download Offline Stamps</span>
                                  </>
                              )}
                          </button>
                      </div>
                  </div>
              )}

              <div className="mt-4 px-2 text-center text-xs text-gray-500 sm:mt-6 sm:text-sm">
                  <p>
                      Customer should open their app and scan the QR code or
                      enter the code manually.
                  </p>
              </div>
          </div>
      </AppLayout>
  );
}