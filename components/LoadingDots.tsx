import styles from "../styles/loading-dots.module.css";

const LoadingDots = ({
  color = "#000",
  style = "small",
}: {
  color: string;
  style: string;
}) => {
  return (
    <div className="h-5 w-5">
    <span className={style == "small" ? styles.loading2 : styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
    </div>
  );
};

export default LoadingDots;

LoadingDots.defaultProps = {
  style: "small",
};
