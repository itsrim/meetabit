import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageTransition from './PageTransition';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { useVisits } from '../context/VisitContext';
import { useMessages } from '../context/MessageContext';

// Import refactored components
import SocialHeader from './Social/SocialHeader';
import SuggestionsTab from './Social/Tabs/SuggestionsTab';
import MessagesTab from './Social/Tabs/MessagesTab';
import VisitorsTab from './Social/Tabs/VisitorsTab';

type TabType = 'suggestions' | 'messages' | 'visitors';

const SocialPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as TabType) || 'suggestions';

    const setActiveTab = (tab: TabType) => {
        setSearchParams({ tab }, { replace: true });
    };

    const [isTabSearchExpanded, setIsTabSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { isRestricted, isPremium } = useFeatureFlags();
    const { getMyVisitors } = useVisits();
    const { getTotalUnread } = useMessages();

    // Features restrictions
    const blurProfiles = isRestricted('blurProfiles');
    const disableMessages = isRestricted('disableMessages');
    const searchDisabled = isRestricted('disableSearch');

    const visitors = getMyVisitors();
    const totalUnread = getTotalUnread();

    return (
        <PageTransition>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>

                <SocialHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isTabSearchExpanded={isTabSearchExpanded}
                    setIsTabSearchExpanded={setIsTabSearchExpanded}
                    isPremium={isPremium}
                    disableMessages={disableMessages}
                    searchDisabled={searchDisabled}
                    totalUnread={totalUnread}
                    visitorsCount={visitors.length}
                />

                <div style={{
                    flex: 1,
                    background: 'var(--color-surface)',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        {activeTab === 'suggestions' && (
                            <SuggestionsTab
                                searchQuery={searchQuery}
                                blurProfiles={blurProfiles}
                            />
                        )}

                        {activeTab === 'messages' && (
                            <MessagesTab searchQuery={searchQuery} />
                        )}

                        {activeTab === 'visitors' && (
                            <VisitorsTab searchQuery={searchQuery} />
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SocialPage;
