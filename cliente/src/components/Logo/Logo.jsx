import "./Logo.styles.css";

function Logo({ className = "" }) {
    return (
        <span
            className={`logo ${className}`}
            style={{ "--logo-mask": 'url("/logo.svg")' }}
            aria-hidden="true"
        />
    );
}

export default Logo;
