import { Box, Flex, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { EditOrDeletePost } from "../../components/EditOrDeletePost";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = ({}) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }
  if (!data?.post) {
    return <Layout>could not find post</Layout>;
  }
  return (
    <Layout>
      <Box>
        <Flex flex={1}>
          <Heading mb={4}>{data.post.title}</Heading>
          <EditOrDeletePost id={data.post.id} />
        </Flex>
        {data.post.text}
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
