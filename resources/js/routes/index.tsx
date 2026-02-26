import '@/i18n';
import { useTheme } from '@/page/theme/useTheme';

// removed react-router-dom

// React Router DOM is disabled as the project has been migrated to Inertia.js
export const AppRoutes = () => {
  useTheme();
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<LandingPage />} />
    //     <Route path="/login" element={<LogInSection />} />
    //     <Route path="/admin" element={<AdminDashboardPage />} />
    //     <Route path="/student-space" element={<StudentSpacePage />} />
    //     <Route path="/mention/informatique" element={<InfoPage />} />
    //     <Route path="/mention/agronomie" element={<AgroPage />} />
    //     <Route path="/mention/economie" element={<EcoPage />} />
    //     <Route
    //       path="/mention/langue-etrangere-applique"
    //       element={<LeaPage />}
    //     />
    //     <Route path="/mention/science-de-la-terre" element={<STPage />} />
    //     <Route path="/mention/droit" element={<DroitPage />} />
    //     <Route path="*" element={<NotFoundPage />} />
    //   </Routes>
    // </BrowserRouter>
    null
  );
};
