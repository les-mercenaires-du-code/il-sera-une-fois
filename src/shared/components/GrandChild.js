const GrandChild = (props) => {

  if (!props.state) {
    return (
      <p>loading</p>
    );
  }


  return (
    <div>
      <h3>Grand Childrend</h3>
      <div>{props.state.test}</div>
    </div>
  );
};

export default GrandChild;
