import PropTypes from "prop-types";
import PublicLayout from "./PublicLayout";
export default function GuestLayout({ onNavigate, currentPage = "home", children }) {
 return <PublicLayout onNavigate={onNavigate} currentPage={currentPage}>{children}</PublicLayout>;
}
GuestLayout.propTypes = { onNavigate: PropTypes.func.isRequired, currentPage: PropTypes.string, children: PropTypes.node };
