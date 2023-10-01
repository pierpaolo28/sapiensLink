import Container from "../shared/Container";

const Hero = () => {
  return (
    <div className="w-full bg-gray-10">
      {/* Use Grid */}
      <Container className="flex flex-col lg:flex-row justify-around">
        <div className="lg-halveWidth">
          <h1 className="lg:text-[64px] font-bold leading-snug tracking-tight text-white ">
            Sharing Knowledge One Link At A Time
          </h1>
        </div>
        <div className="lg-halveWidth">
          <h1 className="lg:text-[64px] font-bold leading-snug tracking-tight text-white ">
            Example Goes Here
          </h1>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
