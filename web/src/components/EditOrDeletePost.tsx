import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditOrDeletePostProps {
  id: number;
}

export const EditOrDeletePost: React.FC<EditOrDeletePostProps> = ({ id }) => {
  const [{ fetching: fetchingDeletePost }, deletePost] =
    useDeletePostMutation();
  // const [{fetching}, updatePost] = useUpdatePostMutation()
  return (
    <Box
      // justifyContent="space-between"
      ml="auto"
      //   flex={1}
      //   mt={4}
    >
      <Link href={"/post/edit/" + id}>
        <IconButton
          mr={4}
          aria-label="edit my post"
          // colorScheme="red"
          icon={<EditIcon />}
          size="sm"
          // isLoading={fetching}
        />
      </Link>
      <IconButton
        aria-label="delete my post"
        colorScheme="red"
        icon={<DeleteIcon />}
        size="sm"
        isLoading={fetchingDeletePost}
        onClick={() => {
          deletePost({ id: id });
        }}
      />
    </Box>
  );
};

// EditIcon
