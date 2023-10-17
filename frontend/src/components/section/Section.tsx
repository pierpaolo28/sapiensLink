import Container from "../shared/Container";

const Section: React.FC<any> = (props) => {
  return (
    <div className="w-full bg-gray-2">
      <Container className={`flex flex-col lg:flex-row flex-wrap lg:h-[800px]`}>
        {/* <div
          className={`flex items-center justify-center w-full lg-halveWidth`}
        >
          Image Here
        </div> */}
        <div className={`flex flex-wrap items-center w-full lg-halveWidth`}>
          <div className="flex justify-center w-full mt-4">
            <h2 className="max-w-[400px] mt-3 lg:text-[64px] text-3xl font-bold leading-snug tracking-tight text-gray-9 lg-heading">
              Subscribe
            </h2>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Section;
